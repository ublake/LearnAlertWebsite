// Only the server forwards Access assertions. No database or moderator secret
// is shipped in the dashboard bundle.
export async function GET(request: Request) { return proxy(request); }
export async function POST(request: Request) { return proxy(request); }
export async function PATCH(request: Request) { return proxy(request); }
export async function PUT(request: Request) { return proxy(request); }
export async function DELETE(request: Request) { return proxy(request); }

async function proxy(request: Request) {
  const url = new URL(request.url);
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  const upload = request.method === 'POST' && /^\/admin\/api\/decks\/[a-fA-F0-9-]{36}\/media$/.test(url.pathname);
  const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (!token) return new Response(JSON.stringify({ error: { message: 'Admin sign-in is required. Cloudflare Access must protect /admin and /admin/*.' } }), { status: 401, headers: jsonHeaders });
  if (request.method !== 'GET' && (request.headers.get('Origin') !== url.origin || (!upload && request.headers.get('Content-Type')?.split(';')[0] !== 'application/json'))) {
    return new Response(JSON.stringify({ error: { message: 'Invalid request origin.' } }), { status: 403, headers: jsonHeaders });
  }
  const headers = new Headers({ 'Cf-Access-Jwt-Assertion': token });
  if (request.method !== 'GET') {
    headers.set('Content-Type', upload ? request.headers.get('Content-Type') || 'application/octet-stream' : 'application/json');
    headers.set('Origin', 'https://learnalertapp.com');
  }
  const target = `https://api.learnalertapp.com/v1/admin/${url.pathname.slice('/admin/api/'.length)}${url.search}`;
  try {
    const response = await fetch(target, { method: request.method, headers, body: request.method === 'GET' ? undefined : request.body, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) throw new Error('Unexpected upstream redirect');
    return new Response(response.body, { status: response.status, headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow'
    } });
  } catch (error) {
    console.error('Admin proxy upstream failure:', error instanceof Error ? error.message : 'Unknown failure');
    return new Response(JSON.stringify({ error: { message: 'The admin API is unavailable.' } }), { status: 502, headers: jsonHeaders });
  }
}
