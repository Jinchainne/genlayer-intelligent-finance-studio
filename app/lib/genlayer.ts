import fs from 'fs';
import os from 'os';
import path from 'path';
import { createAccount, createClient } from 'genlayer-js';
import { localnet, studionet, testnetAsimov, testnetBradbury } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

const CHAINS: Record<string, any> = {
  localnet,
  studionet,
  'testnet-asimov': testnetAsimov,
  testnetasimov: testnetAsimov,
  'testnet-bradbury': testnetBradbury,
  testnetbradbury: testnetBradbury,
};

type GenLayerDeployment = {
  network?: string;
  rpc?: string;
  contract?: string;
  address?: string;
  txHash?: string;
  deploymentTx?: string;
};

function readDeployment(): GenLayerDeployment {
  try {
    const file = path.join(process.cwd(), 'contracts', 'deployment.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function readCliConfig() {
  try {
    const file = path.join(os.homedir(), '.genlayer', 'genlayer-config.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

async function readUnlockedPrivateKeyFromKeychain() {
  try {
    const req = (0, eval)('require');
    const keytar = req('keytar');
    const cliConfig = readCliConfig();
    const activeAccount = String(cliConfig.activeAccount || 'default');
    return await keytar.getPassword('genlayer-cli', `account:${activeAccount}`);
  } catch {
    return null;
  }
}

async function getGenLayerPrivateKey() {
  const envKey =
    process.env.GENLAYER_PRIVATE_KEY ||
    process.env.GENLAYER_ACCOUNT_PRIVATE_KEY ||
    process.env.GENLAYER_WALLET_PRIVATE_KEY ||
    null;
  if (envKey) return envKey;
  return readUnlockedPrivateKeyFromKeychain();
}

export function allowsEphemeralGenLayerSigner() {
  return process.env.GENLAYER_DISABLE_EPHEMERAL_SIGNER !== 'true';
}

function getChain(network: string) {
  return CHAINS[String(network || 'studionet').toLowerCase()] || studionet;
}

export function getGenLayerConfig() {
  const deployment = readDeployment();
  const cliConfig = readCliConfig();
  const network = process.env.GENLAYER_NETWORK || deployment.network || cliConfig.network || 'studionet';
  return {
    network,
    chain: getChain(network),
    rpc: process.env.GENLAYER_RPC_URL || deployment.rpc || 'https://studio.genlayer.com/api',
    address: deployment.address || process.env.GENLAYER_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || '',
    contract: deployment.contract || 'GenLayerFinancePolicy',
    txHash: deployment.deploymentTx || deployment.txHash || process.env.GENLAYER_DEPLOYMENT_TX || '',
  };
}

export function parseKeyValueString(raw: string) {
  const parsed: Record<string, string> = {};
  for (const part of String(raw || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    parsed[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return parsed;
}

export function parsePolicyDecision(raw: string) {
  const parsed = parseKeyValueString(raw);
  return {
    raw,
    approved: String(parsed.approved || '').toLowerCase() === 'yes',
    riskLevel: parsed.risk_level || 'unknown',
    reason: parsed.reason || 'No reason returned by GenLayer policy contract.',
    fields: parsed,
  };
}

export function parseLatestStateString(raw: string) {
  const text = String(raw || '');
  const reportMatch = text.match(/latest_report_hash=(.*?);latest_signal=/);
  const signalMatch = text.match(/;latest_signal=(.*?);latest_policy=/);
  const policyIndex = text.indexOf(';latest_policy=');
  return {
    latest_report_hash: reportMatch?.[1] || '',
    latest_signal: signalMatch?.[1] || '',
    latest_policy: policyIndex >= 0 ? text.slice(policyIndex + ';latest_policy='.length) : '',
  };
}

function getExecutionResultName(receipt: any) {
  return (
    receipt?.txExecutionResultName ||
    receipt?.executionResultName ||
    receipt?.result_name ||
    receipt?.consensus_data?.leader_receipt?.[0]?.execution_result ||
    ''
  );
}

function assertSuccessfulReceipt(receipt: any) {
  const execution = String(getExecutionResultName(receipt) || '').toUpperCase();
  if (execution && execution.includes('ERROR')) {
    throw new Error(`GenLayer contract execution failed: ${execution}`);
  }
}

function summarizeReceipt(receipt: any) {
  return {
    hash: receipt?.hash || receipt?.tx_id || null,
    status: receipt?.status_name || receipt?.status || null,
    result: receipt?.result_name || receipt?.txExecutionResultName || receipt?.result || null,
    sender: receipt?.sender || receipt?.from_address || null,
    recipient: receipt?.recipient || receipt?.to_address || null,
  };
}

async function getReadClient() {
  const cfg = getGenLayerConfig();
  return createClient({
    chain: cfg.chain,
    endpoint: cfg.rpc,
  });
}

async function getWriteClient() {
  const cfg = getGenLayerConfig();
  const privateKey = await getGenLayerPrivateKey();
  if (!privateKey && !allowsEphemeralGenLayerSigner()) {
    throw new Error('GenLayer signer not configured. Set GENLAYER_PRIVATE_KEY on deploy, or unlock the local GenLayer account for development.');
  }
  return createClient({
    chain: cfg.chain,
    endpoint: cfg.rpc,
    account: privateKey ? createAccount(privateKey as `0x${string}`) : createAccount(),
  });
}

export async function genlayerCall(method: string, args: Array<string | number> = []) {
  const cfg = getGenLayerConfig();
  if (!cfg.address) {
    throw new Error('GENLAYER_CONTRACT_ADDRESS is not configured.');
  }
  const client = await getReadClient();
  const result = await client.readContract({
    address: cfg.address as `0x${string}`,
    functionName: method,
    args,
  });
  return {
    ok: true,
    method,
    args,
    address: cfg.address,
    rpc: cfg.rpc,
    result: String(result ?? ''),
    source: 'genlayer-js',
  };
}

export async function genlayerWrite(method: string, args: Array<string | number> = []) {
  const cfg = getGenLayerConfig();
  if (!cfg.address) {
    throw new Error('GENLAYER_CONTRACT_ADDRESS is not configured.');
  }
  const client = await getWriteClient();
  const txHash = await client.writeContract({
    address: cfg.address as `0x${string}`,
    functionName: method,
    args,
    value: BigInt(0),
  });
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
  });
  assertSuccessfulReceipt(receipt);
  let result = '';
  try {
    const latest = await genlayerCall('latest_state');
    const latestParsed = parseLatestStateString(latest.result);
    result = latestParsed.latest_policy || latest.result;
  } catch {
    result = receipt?.txExecutionResultName || String(txHash);
  }
  return {
    ok: true,
    method,
    args,
    address: cfg.address,
    rpc: cfg.rpc,
    txHash,
    receipt: summarizeReceipt(receipt),
    result: String(result || ''),
    source: 'genlayer-js',
  };
}

export async function getGenLayerContractState() {
  const cfg = getGenLayerConfig();
  const [project, counters, latestState, signerKey] = await Promise.all([
    genlayerCall('project'),
    genlayerCall('counters'),
    genlayerCall('latest_state'),
    getGenLayerPrivateKey(),
  ]);
  return {
    ok: true,
    contract: cfg.contract,
    network: cfg.network,
    rpc: cfg.rpc,
    address: cfg.address,
    txHash: cfg.txHash,
    project: project.result,
    counters: counters.result,
    countersParsed: parseKeyValueString(counters.result),
    latestState: latestState.result,
    latestStateParsed: parseLatestStateString(latestState.result),
    signerConfigured: Boolean(signerKey) || allowsEphemeralGenLayerSigner(),
    signerMode: signerKey ? 'configured' : 'ephemeral-policy-signer',
    source: 'genlayer-js',
  };
}
