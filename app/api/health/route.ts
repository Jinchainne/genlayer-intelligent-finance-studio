import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(){
  return NextResponse.json({
    ok:true,
    name:'GenLayer Intelligent Finance Studio',
    liveOnly:true,
    configured:{
      sourceFeedAdapter:Boolean(process.env.SOSOVALUE_API_KEY),
      executionAdapterKeyName:Boolean(process.env.SODEX_API_KEY_NAME),
      executionAdapterPublicKey:Boolean(process.env.SODEX_PUBLIC_KEY),
      executionAdapterPrivateKey:Boolean(process.env.SODEX_API_PRIVATE_KEY || process.env.SODEX_PRIVATE_KEY || process.env.SODEX_WALLET_PRIVATE_KEY),
      aiRouter:Boolean(process.env.AI_API_KEY || process.env.CHAINOPERA_API_KEY || process.env.OPENAI_API_KEY),
      aiBaseURL: process.env.AI_BASE_URL || 'https://router.chainopera.ai/v1',
      aiModel: process.env.AI_MODEL || 'Qwen3-32B',
      executionAdapterArmed:process.env.ENABLE_LIVE_TRADING === 'true',
      liveTrading:process.env.ENABLE_LIVE_TRADING === 'true',
      localRuntimeBridgeUrl: process.env.JINBOT_BRIDGE_URL || process.env.JINBOT_LOCAL_URL || 'http://127.0.0.1:8787',
      localRuntimeBridgeConfigured:Boolean(process.env.JINBOT_BRIDGE_URL || process.env.JINBOT_LOCAL_URL),
      localRuntimeStateFile:Boolean(process.env.JINBOT_STATE_PATH),
      commandChannel:Boolean((process.env.JINBOT_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) && (process.env.JINBOT_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID)),
      localRuntimePanelSecret:Boolean(process.env.JINBOT_PANEL_SECRET || process.env.ADMIN_SECRET)
    },
    timestamp:new Date().toISOString(),
    secretExposure:'No private key, Telegram token, admin secret or bridge secret is returned.'
  });
}

