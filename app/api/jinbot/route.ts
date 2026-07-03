import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type FetchResult = { ok: boolean; status: number; data: any; url: string; error?: string };

const jsonHeaders = { accept: 'application/json', 'content-type': 'application/json' };
const DEFAULT_JINBOT_BASE = 'http://127.0.0.1:8787';
const STATUS_PATHS = ['/api/bots/status', '/api/pnl', '/api/control/status', '/api/status', '/status', '/health', '/api/health', '/api/debug/ping', '/api/state', '/state', '/api/dashboard'];
const SIGNAL_PATHS = ['/api/signals', '/signals', '/api/latest-signal', '/latest-signal', '/api/cross/signals', '/cross/signals'];
const POSITION_PATHS = ['/api/position', '/api/positions', '/positions', '/api/orders', '/orders'];
const COMMAND_PATHS = ['/api/command', '/command', '/api/telegram/command', '/telegram/command', '/api/bot/command'];
const PNL_PATHS = ['/api/pnl'];
const TRADE_SETTINGS_PATHS = ['/api/trade-settings'];
const TRADES_PATHS = ['/api/trades'];
const EVENTS_PATHS = ['/api/events'];

function getBaseUrl() {
  return (process.env.JINBOT_BRIDGE_URL || process.env.JINBOT_LOCAL_URL || DEFAULT_JINBOT_BASE).replace(/\/$/, '');
}

function safeJson(value: any) {
  try { return JSON.stringify(value); } catch { return String(value); }
}

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 4500): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: 'no-store', headers: { ...jsonHeaders, ...(init?.headers || {}) } });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    return { ok: res.ok, status: res.status, data, url };
  } catch (error: any) {
    return { ok: false, status: 0, data: null, url, error: error?.message || 'network_error' };
  } finally {
    clearTimeout(timeout);
  }
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.signals)) return value.signals;
  if (Array.isArray(value?.data?.signals)) return value.data.signals;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data?.items)) return value.data.items;
  if (value && typeof value === 'object' && (value.symbol || value.side || value.signal)) return [value];
  return [];
}

function normalizeSignal(item: any, index = 0) {
  const signal = item?.signal || item?.side || item?.direction || item?.action || item?.type || item?.recommendation;
  const symbol = item?.symbol || item?.market || item?.pair || item?.ticker || item?.coin || item?.asset || 'UNKNOWN';
  const confidence = item?.confidence ?? item?.score ?? item?.probability ?? item?.conviction ?? item?.strength;
  return {
    id: item?.id || item?.signalId || item?.time || item?.timestamp || `jinbot-${index}`,
    symbol: String(symbol).toUpperCase(),
    side: String(signal || 'WAIT').toUpperCase(),
    confidence: confidence === undefined || confidence === null || confidence === '' ? null : Number(confidence),
    entry: item?.entry ?? item?.entryPrice ?? item?.price ?? item?.markPrice ?? null,
    takeProfit: item?.takeProfit ?? item?.tp ?? item?.target ?? item?.targets ?? null,
    stopLoss: item?.stopLoss ?? item?.sl ?? item?.invalidAt ?? null,
    leverage: item?.leverage ?? item?.lev ?? null,
    reason: item?.reason || item?.message || item?.note || item?.summary || item?.comment || '',
    regime: item?.regime || item?.marketRegime || item?.mode || null,
    raw: item,
    time: item?.time || item?.timestamp || item?.createdAt || item?.updatedAt || null,
  };
}

function signalCandidateScore(value: any) {
  if (!value || typeof value !== 'object') return 0;
  const keys = Object.keys(value).map(k => k.toLowerCase());
  const joined = keys.join(' ');
  let score = 0;
  if (/(symbol|market|pair|ticker|asset)/.test(joined)) score += 2;
  if (/(signal|side|direction|recommendation|action)/.test(joined)) score += 2;
  if (/(entry|price|tp|takeprofit|sl|stoploss|confidence|score|leverage)/.test(joined)) score += 1;
  return score;
}

function extractSignalsDeep(root: any, maxDepth = 5) {
  const found: any[] = [];
  const seen = new Set<any>();
  function visit(value: any, depth: number) {
    if (!value || depth > maxDepth || seen.has(value)) return;
    if (typeof value === 'object') seen.add(value);
    if (Array.isArray(value)) {
      const scored = value.filter(x => signalCandidateScore(x) >= 3);
      if (scored.length) found.push(...scored);
      value.slice(0, 20).forEach(x => visit(x, depth + 1));
      return;
    }
    if (typeof value !== 'object') return;
    if (signalCandidateScore(value) >= 4) found.push(value);
    for (const key of ['signals','recentSignals','lastSignals','activeSignals','signalHistory','history','latestSignal','lastSignal','currentSignal','tradeSignal']) {
      const child = value[key];
      if (child) {
        if (Array.isArray(child)) found.push(...child.filter(x => signalCandidateScore(x) >= 2));
        else if (typeof child === 'object') found.push(child);
      }
    }
    Object.values(value).slice(0, 80).forEach(x => visit(x, depth + 1));
  }
  visit(root, 0);
  const unique = new Map<string, any>();
  found.forEach((item, i) => {
    const key = String(item?.id || item?.signalId || item?.timestamp || item?.time || `${item?.symbol || item?.market || 'unknown'}-${item?.side || item?.signal || i}`);
    if (!unique.has(key)) unique.set(key, item);
  });
  return [...unique.values()];
}

async function readStateFile() {
  const statePath = process.env.JINBOT_STATE_PATH || '';
  if (!statePath) return { ok: false, configured: false, data: null as any, fileName: null as string | null, error: 'JINBOT_STATE_PATH not configured' };
  try {
    const raw = await fs.readFile(statePath, 'utf8');
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { raw: raw.slice(-12000) }; }
    return { ok: true, configured: true, data, fileName: path.basename(statePath), error: null as string | null };
  } catch (error: any) {
    return { ok: false, configured: true, data: null as any, fileName: path.basename(statePath), error: error?.message || 'state_file_read_failed' };
  }
}

async function firstWorking(base: string, paths: string[], timeoutMs = 4500) {
  const attempts: FetchResult[] = [];
  for (const path of paths) {
    const result = await fetchJson(`${base}${path}`, undefined, timeoutMs);
    attempts.push(result);
    if (result.ok && result.data !== null) return { result, attempts };
  }
  return { result: attempts.find(x => x.ok) || attempts[0] || null, attempts };
}

function checkSecret(req: NextRequest, body: any) {
  const configuredSecret = process.env.JINBOT_PANEL_SECRET || process.env.ADMIN_SECRET || '';
  if (!configuredSecret) return { ok: true, required: false };
  const supplied = req.headers.get('x-jinbot-secret') || req.headers.get('x-admin-secret') || body?.secret || body?.adminSecret || body?.jinbotSecret || '';
  return { ok: String(supplied) === String(configuredSecret), required: true };
}

async function sendTelegramCommand(command: string) {
  const token = process.env.JINBOT_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
  const chatId = process.env.JINBOT_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';
  if (!token || !chatId) return { ok: false, configured: false, reason: 'Telegram token/chat id is not configured.' };
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const result = await fetchJson(url, {
    method: 'POST',
    body: JSON.stringify({ chat_id: chatId, text: command, disable_web_page_preview: true }),
  }, 10000);
  return { ok: result.ok, configured: true, status: result.status, data: result.ok ? result.data : undefined, error: result.ok ? undefined : (result.error || result.data) };
}

function normalizeCommand(command: string) {
  const [rawName, ...args] = command.trim().replace(/^\/+/, '').split(/\s+/).filter(Boolean);
  const aliases: Record<string, string> = {
    start: 'start_bot',
    stop: 'stop_bot',
    pause: 'stop_bot',
    resume: 'start_bot',
    signal: 'status',
    signals: 'status',
    positions: 'check',
    position: 'check',
    pnl: 'status',
    help: 'status',
  };
  const name = aliases[rawName?.toLowerCase() || ''] || rawName?.toLowerCase() || '';
  return { name, args };
}

function dashboardRequestFor(command: string) {
  const { name, args } = normalizeCommand(command);
  const amount = Number(args[0]);
  const bodyWithAmount = Number.isFinite(amount) && amount > 0 ? { amount } : {};
  const routes: Record<string, { method: 'GET' | 'POST'; path: string; body?: any }> = {
    status: { method: 'GET', path: '/api/bots/status' },
    check: { method: 'GET', path: '/api/bots/status' },
    check_perps: { method: 'GET', path: '/api/bots/status' },
    check_spot: { method: 'GET', path: '/api/bots/status' },
    trades: { method: 'GET', path: '/api/trades' },
    start_bot: { method: 'POST', path: '/api/bots/start_all' },
    stop_bot: { method: 'POST', path: '/api/bots/stop_all' },
    start_perps: { method: 'POST', path: '/api/bots/perps/start' },
    stop_perps: { method: 'POST', path: '/api/bots/perps/stop' },
    start_spot: { method: 'POST', path: '/api/bots/spot/start' },
    stop_spot: { method: 'POST', path: '/api/bots/spot/stop' },
    close_position: { method: 'POST', path: '/api/bots/perps/close_position' },
    close_perps: { method: 'POST', path: '/api/bots/perps/close_position' },
    close_spot: { method: 'POST', path: '/api/bots/spot/close_position' },
    set_max_loss: { method: 'POST', path: '/api/bots/perps/set_max_loss', body: bodyWithAmount },
    set_mode: { method: 'POST', path: '/api/control/set_mode', body: { mode: args[0] } },
  };
  return routes[name] || null;
}

async function sendDashboardCommand(base: string, command: string) {
  const route = dashboardRequestFor(command);
  if (!route) return { ok: false, skipped: true, reason: 'No direct dashboard endpoint for this command.' };
  const bridgeSecret = process.env.JINBOT_BRIDGE_SECRET || '';
  const headers: Record<string, string> = bridgeSecret ? { 'x-jinbot-secret': bridgeSecret } : {};
  const result = await fetchJson(`${base}${route.path}`, {
    method: route.method,
    headers,
    body: route.method === 'POST' ? JSON.stringify(route.body || {}) : undefined,
  }, 9000);
  return { ok: result.ok, endpoint: result.url, status: result.status, data: result.data, error: result.error };
}

async function sendLocalBridgeCommand(base: string, command: string) {
  const dashboard = await sendDashboardCommand(base, command);
  if (dashboard.ok) return { ok: true, mode: 'dashboard-api', ...dashboard, attempts: [dashboard] };

  const bridgeSecret = process.env.JINBOT_BRIDGE_SECRET || '';
  const headers: Record<string, string> = bridgeSecret ? { 'x-jinbot-secret': bridgeSecret } : {};
  const attempts: FetchResult[] = [];
  for (const path of COMMAND_PATHS) {
    const result = await fetchJson(`${base}${path}`, { method: 'POST', headers, body: JSON.stringify({ command }) }, 7000);
    attempts.push(result);
    if (result.ok) return { ok: true, endpoint: result.url, status: result.status, data: result.data, attempts };
  }
  return { ok: false, endpoint: null, dashboard, attempts };
}

export async function GET() {
  const base = getBaseUrl();
  const [status, signals, positions, pnl, tradeSettings, trades, events, stateFile] = await Promise.all([
    firstWorking(base, STATUS_PATHS),
    firstWorking(base, SIGNAL_PATHS),
    firstWorking(base, POSITION_PATHS),
    firstWorking(base, PNL_PATHS, 3500),
    firstWorking(base, TRADE_SETTINGS_PATHS, 3500),
    firstWorking(base, TRADES_PATHS, 3500),
    firstWorking(base, EVENTS_PATHS, 3500),
    readStateFile(),
  ]);
  const httpSignals = asArray(signals.result?.data);
  const fileSignals = stateFile.ok ? extractSignalsDeep(stateFile.data) : [];
  const signalRows = (httpSignals.length ? httpSignals : fileSignals).map(normalizeSignal).slice(0, 25);
  return NextResponse.json({
    ok: Boolean(status.result?.ok || signals.result?.ok || positions.result?.ok || stateFile.ok),
    name: 'JINBOT_SODEX CROSS bridge',
    mode: 'local-http-file-or-telegram',
    updatedAt: new Date().toISOString(),
    configured: {
      bridgeUrl: base,
      localBridge: Boolean(process.env.JINBOT_BRIDGE_URL || process.env.JINBOT_LOCAL_URL),
      bridgeSecret: Boolean(process.env.JINBOT_BRIDGE_SECRET),
      stateFile: Boolean(process.env.JINBOT_STATE_PATH),
      stateFileName: stateFile.fileName,
      telegram: Boolean((process.env.JINBOT_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN) && (process.env.JINBOT_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID)),
      panelSecret: Boolean(process.env.JINBOT_PANEL_SECRET || process.env.ADMIN_SECRET),
    },
    status: status.result?.data || stateFile.data || null,
    pnl: pnl.result?.data || null,
    tradeSettings: tradeSettings.result?.data || null,
    trades: trades.result?.data || null,
    events: events.result?.data || null,
    positions: positions.result?.data || null,
    signals: signalRows,
    signalSource: httpSignals.length ? 'local-http' : fileSignals.length ? 'state-file' : 'unavailable',
    endpoints: {
      status: status.result?.ok ? status.result.url : null,
      signals: signals.result?.ok ? signals.result.url : null,
      positions: positions.result?.ok ? positions.result.url : null,
      pnl: pnl.result?.ok ? pnl.result.url : null,
      tradeSettings: tradeSettings.result?.ok ? tradeSettings.result.url : null,
      trades: trades.result?.ok ? trades.result.url : null,
      events: events.result?.ok ? events.result.url : null,
      stateFile: stateFile.ok ? stateFile.fileName : null,
    },
    diagnostics: {
      stateFile: { ok: stateFile.ok, configured: stateFile.configured, fileName: stateFile.fileName, error: stateFile.error },
      statusAttempts: status.attempts.map(x => ({ url: x.url, ok: x.ok, status: x.status, error: x.error })),
      signalAttempts: signals.attempts.map(x => ({ url: x.url, ok: x.ok, status: x.status, error: x.error })),
      positionAttempts: positions.attempts.map(x => ({ url: x.url, ok: x.ok, status: x.status, error: x.error })),
    },
    secretExposure: 'No Telegram token, bridge secret, admin secret, local path or private key is returned.',
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const command = String(body.command || body.text || '').trim();
  if (!command) return NextResponse.json({ ok: false, error: 'command_required' }, { status: 400 });
  const auth = checkSecret(req, body);
  if (!auth.ok) return NextResponse.json({ ok: false, error: 'jinbot_secret_invalid', secretRequired: auth.required }, { status: 401 });

  const base = getBaseUrl();
  const local = await sendLocalBridgeCommand(base, command);
  const telegram = local.ok ? { ok: false, skipped: true, reason: 'Local bridge accepted command.' } : await sendTelegramCommand(command);
  return NextResponse.json({
    ok: Boolean(local.ok || telegram.ok),
    command,
    deliveredBy: local.ok ? 'local-bridge' : telegram.ok ? 'telegram' : 'none',
    local,
    telegram,
    message: local.ok || telegram.ok ? 'Command forwarded to JINBOT_SODEX CROSS.' : `Command was not delivered. Local bridge failed and Telegram is unavailable: ${safeJson(telegram)}`,
    secretExposure: 'No Telegram token, bridge secret, admin secret or private key is returned.',
  }, { status: local.ok || telegram.ok ? 200 : 502 });
}
