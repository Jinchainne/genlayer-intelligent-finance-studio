import { execSync } from 'child_process';
import fs from 'fs';

const deployment = JSON.parse(fs.readFileSync('contracts/deployment.json', 'utf8'));
const address = deployment.address;

function genlayerCall(method) {
  const safeAddress = JSON.stringify(address);
  const safeMethod = JSON.stringify(method);
  return execSync(`npx genlayer call ${safeAddress} ${safeMethod}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const project = genlayerCall('project');
const counters = genlayerCall('counters');
const latestState = genlayerCall('latest_state');

if (!project.includes('GenLayer Intelligent Finance Studio')) {
  throw new Error('project() verification failed');
}

if (!/reports=\d+;signals=\d+;policy_checks=\d+/.test(counters)) {
  throw new Error('counters() verification failed');
}

if (!latestState.includes('latest_policy=')) {
  throw new Error('latest_state() verification failed');
}

console.log(`GenLayer contract verified: ${address}`);
