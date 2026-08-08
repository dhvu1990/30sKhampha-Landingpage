const ALLOWED_ORIGIN = 'https://30skhampha.io.vn';
const COUNTER_KEY = 'site_visits';

function cors(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    if (request.method === 'POST') {
      await env.DB.prepare(
        `INSERT INTO counters (key, value, updated_at)
         VALUES (?1, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = value + 1, updated_at = CURRENT_TIMESTAMP`
      ).bind(COUNTER_KEY).run();
    }

    const row = await env.DB.prepare('SELECT value FROM counters WHERE key = ?1').bind(COUNTER_KEY).first();
    return new Response(JSON.stringify({ count: Number(row?.value || 0) }), { status: 200, headers });
  }
};
