import { NextRequest, NextResponse } from 'next/server';
import { createExecutionPreview, executeSodexOrder } from '../../lib/providers';
import { genlayerWrite, parsePolicyDecision } from '../../lib/genlayer';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>({}));
  const action = body.action || 'preview';
  try {
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
      `tp=${preview.preview?.takeProfit || 'none'}`,
      `sl=${preview.preview?.stopLoss || 'none'}`,
      `schedule=${preview.preview?.schedule || 'manual'}`,
      `warnings=${(preview.warnings || []).join(' | ') || 'none'}`,
    ].join('; ');

    let policyCheck: any = null;
    try {
      const contractWrite = await genlayerWrite('check_trade_intent', [
        preview.preview?.market || 'BTCUSDT',
        preview.preview?.side || 'buy',
        notionalUsd,
        Number(preview.preview?.leverage || 1),
        maxNotionalUsd,
        maxLeverage,
        evidence,
      ]);
      policyCheck = {
        ok: true,
        contractWrite,
        policy: parsePolicyDecision(contractWrite.result),
      };
    } catch (error: any) {
      policyCheck = {
        ok: false,
        error: error?.message || 'genlayer_policy_check_failed',
      };
    }

    if (action === 'execute' && policyCheck?.ok && !policyCheck.policy?.approved) {
      return NextResponse.json({
        ...preview,
        ok: false,
        submitted: false,
        blockedByPolicy: true,
        policyCheck,
        error: `GenLayer policy rejected this intent: ${policyCheck.policy?.reason || 'rejected'}`,
      }, { status: 400 });
    }

    const result = action === 'execute' ? await executeSodexOrder(body) : preview;
    const mergedOk = Boolean(result?.ok) && (policyCheck?.ok ? Boolean(policyCheck.policy?.approved) : true);
    return NextResponse.json({
      ...result,
      ok: mergedOk,
      policyCheck,
      policyBoundToExecution: true,
    });
  } catch (error:any) {
    return NextResponse.json({ ok:false, error:error?.message || 'execution_failed', secretExposure:'No secret returned.' }, { status: 500 });
  }
}
