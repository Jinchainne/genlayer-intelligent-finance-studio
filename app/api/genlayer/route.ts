import { NextRequest, NextResponse } from 'next/server';
import {
  genlayerWrite,
  getGenLayerContractState,
  parsePolicyDecision,
} from '../../lib/genlayer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await getGenLayerContractState();
    return NextResponse.json(state);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'genlayer_read_failed' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '').trim();

  try {
    if (action !== 'check_trade_intent') {
      return NextResponse.json({ ok: false, error: 'Unsupported GenLayer action.' }, { status: 400 });
    }

    const symbol = String(body.symbol || body.market || 'BTCUSDT').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const side = String(body.side || 'buy');
    const notionalUsd = Math.max(0, Math.round(Number(body.notionalUsd || body.notional_usd || 0)));
    const leverage = Math.max(1, Math.round(Number(body.leverage || 1)));
    const maxNotionalUsd = Math.max(1, Math.round(Number(body.maxNotionalUsd || process.env.MAX_ORDER_NOTIONAL_USD || 100000)));
    const maxLeverage = Math.max(1, Math.round(Number(body.maxLeverage || process.env.MAX_LEVERAGE || 20)));
    const evidence = String(body.evidence || 'Execution preview submitted from GenLayer Intelligent Finance Studio.').slice(0, 6000);

    const write = await genlayerWrite('check_trade_intent', [
      symbol,
      side,
      notionalUsd,
      leverage,
      maxNotionalUsd,
      maxLeverage,
      evidence,
    ]);

    return NextResponse.json({
      ok: true,
      action,
      symbol,
      side,
      notionalUsd,
      leverage,
      maxNotionalUsd,
      maxLeverage,
      evidence,
      contractWrite: write,
      policy: parsePolicyDecision(write.result),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, action, error: error?.message || 'genlayer_write_failed' },
      { status: 500 },
    );
  }
}
