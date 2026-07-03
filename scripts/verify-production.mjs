const base = process.env.VERIFY_APP_URL || 'https://genlayer-intelligent-finance-studio.vercel.app';

async function json(path, init) {
  const res = await fetch(`${base}${path}`, init);
  if (!res.ok) throw new Error(`${path} failed with ${res.status}`);
  return res.json();
}

async function retry(label, fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 1200 * (i + 1)));
  }
  throw lastError || new Error(`${label} failed`);
}

const health = await json('/api/health');
if (health?.configured?.aiProvider !== 'Groq') throw new Error('Groq provider is not configured');
if (!health?.configured?.genLayerContractAddress) throw new Error('GenLayer contract address is missing');
if (!health?.configured?.sourceFeedAdapter) throw new Error('Source adapter is not configured');

const news = await json('/api/news');
if (!Array.isArray(news?.news) || news.news.length === 0) throw new Error('News source returned no items');

const copilot = await retry('Groq copilot', async () => {
  const response = await json('/api/copilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      task: 'Return one short sentence confirming the GenLayer production verification path.',
      context: [],
    }),
  });
  return response?.ok && response?.answer ? response : null;
});
if (copilot?.provider && !String(copilot.provider).includes('Groq')) throw new Error(`Unexpected AI provider: ${copilot.provider}`);

console.log(`Production verified: ${base}`);
