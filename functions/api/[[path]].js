/* =============================================
   CLOUDFLARE PAGES FUNCTION — /api/* handler
   Backed by R2 bucket (DATA_BUCKET binding).
   Stores: settings, quizScores, pageSummary, badges, flashcardState
   Auth: Authorization: Bearer {API_KEY}
   ============================================= */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const VALID_STORES = new Set([
  'settings', 'quizScores', 'pageSummary', 'badges', 'flashcardState'
]);

function corsResponse(body, status, extra = {}) {
  return new Response(body, {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json', ...extra },
  });
}

function unauthorized() {
  return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401);
}

function badRequest(msg) {
  return corsResponse(JSON.stringify({ error: msg }), 400);
}

export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Auth check
  const apiKey = env.API_KEY || 'continuous.engineering';
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader !== `Bearer ${apiKey}`) {
    return unauthorized();
  }

  // Parse store name from URL: /api/data/{store}
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/data\/?/, '').split('/').filter(Boolean);
  const store = parts[0];

  if (!store || !VALID_STORES.has(store)) {
    return badRequest(`Invalid store. Valid stores: ${[...VALID_STORES].join(', ')}`);
  }

  if (!env.DATA_BUCKET) {
    return corsResponse(JSON.stringify({ error: 'DATA_BUCKET binding not configured' }), 503);
  }

  const r2Key = `data/${store}.json`;

  if (request.method === 'GET') {
    const obj = await env.DATA_BUCKET.get(r2Key);
    if (!obj) {
      return corsResponse('{}', 200);
    }
    const text = await obj.text();
    return corsResponse(text, 200);
  }

  if (request.method === 'PUT') {
    const body = await request.text();
    await env.DATA_BUCKET.put(r2Key, body, {
      httpMetadata: { contentType: 'application/json' },
    });
    return corsResponse(JSON.stringify({ ok: true }), 200);
  }

  if (request.method === 'DELETE') {
    await env.DATA_BUCKET.delete(r2Key);
    return corsResponse(JSON.stringify({ ok: true }), 200);
  }

  return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
}
