import { NextRequest, NextResponse } from 'next/server';
import { assertAutomationSecret, createExecutionPreview, executeSodexOrder } from '../../lib/providers';
import { genlayerWrite, parsePolicyDecision } from '../../lib/genlayer';
export const dynamic = 'force-dynamic';

async function bindPolicy(body: any) {
  const preview = await createExecutionPreview(body);
  const notionalSource = Number(preview.preview?.price || 0) || Number(body.price || 0);
  const notionalUsd = Math.max(0, Math.round(Number(preview.preview?.amount || 0) * notionalSource));
  const maxNotionalUsd = Math.max(1, Math.round(Number(body.maxNotional || process.env.MAX_ORDER_NOTIONAL_USD || 100000)));
  const maxLeverage = Math.max(1, Math.round(Number(process.env.MAX_LEVERAGE || 20)));
  const evidence = [
    `market=${preview.preview?.market || 'BTCUSDT'}`,
    `product=${preview.preview?.product || 'spot'}`,
    `side=${preview.preview?.side || 'buy'}`,
    `orderType=${preview.preview?.orderType || 'market'}`,
    `amount=${preview.preview?.amount || 0}`,
    `price=${preview.preview?.price || 'mark'}`,
    `automation=${body.automation ? 'true' : 'false'}`,
    `warnings=${(preview.warnings || []).join(' | ') || 'none'}`,
  ].join('; ');

  const contractWrite = await genlayerWrite('check_trade_intent', [
    preview.preview?.market || 'BTCUSDT',
    preview.preview?.side || 'buy',
    notionalUsd,
    Number(preview.preview?.leverage || 1),
    maxNotionalUsd,
    maxLeverage,
    evidence,
  ]);

  return {
    preview,
    policyCheck: {
      ok: true,
      contractWrite,
      policy: parsePolicyDecision(contractWrite.result),
    },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = body.action === 'execute' ? 'execute' : 'preview';
  try {
    const bound = await bindPolicy({ ...body, automation: true });
    if (action === 'execute' && !bound.policyCheck.policy.approved) {
      return NextResponse.json({
        ok: false,
        automation: true,
        action,
        blockedByPolicy: true,
        result: bound.preview,
        policyCheck: bound.policyCheck,
        error: `GenLayer policy rejected this automation intent: ${bound.policyCheck.policy.reason}`,
        secretExposure: 'No private key, signature, nonce or payload hash is returned.',
      }, { status: 400 });
    }
    const result = action === 'execute' ? await executeSodexOrder({ ...body, automation: true }) : bound.preview;
    return NextResponse.json({ ok: true, automation: true, action, result, policyCheck: bound.policyCheck, policyBoundToExecution: true, secretExposure: 'No private key, signature, nonce or payload hash is returned.' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, automation: true, error: error?.message || 'automation_failed', secretExposure: 'No secret returned.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const reqSecret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-automation-secret');
  const auth = assertAutomationSecret(reqSecret);
  if (!auth.ok) return NextResponse.json({ ok:false, automation:true, error:auth.reason }, { status: 401 });
  const raw = process.env.AUTO_TRADE_CONFIG;
  if (!raw) return NextResponse.json({ ok: false, automation: false, reason: 'AUTO_TRADE_CONFIG not set. Use UI scheduler or configure Vercel Cron env.' });
  try {
    const config = JSON.parse(raw);
    const shouldExecute = config.action === 'execute' && process.env.ENABLE_LIVE_TRADING === 'true';
    const bound = await bindPolicy({ ...config, automation: true });
    if (shouldExecute && !bound.policyCheck.policy.approved) {
      return NextResponse.json({
        ok: false,
        automation: true,
        mode: 'live',
        blockedByPolicy: true,
        result: bound.preview,
        policyCheck: bound.policyCheck,
        error: `GenLayer policy rejected this automation intent: ${bound.policyCheck.policy.reason}`,
      }, { status: 400 });
    }
    const result = shouldExecute ? await executeSodexOrder({ ...config, automation: true }) : bound.preview;
    return NextResponse.json({ ok: true, automation: true, mode: shouldExecute ? 'live' : 'preview', result, policyCheck: bound.policyCheck, policyBoundToExecution: true, secretExposure: 'No secret returned.' });
  } catch (error: any) {
    return NextResponse.json({ ok: false, automation: true, error: error?.message || 'bad_AUTO_TRADE_CONFIG' }, { status: 500 });
  }
}
