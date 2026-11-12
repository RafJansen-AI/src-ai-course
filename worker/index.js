// Link-only access. Anyone who opens the site with ?k=<ACCESS_KEY> gets a cookie
// and can then use the bare address for a year. Without the key or the cookie,
// visitors see a short "not available" page. This is shared-link protection, not
// per-person access control: anyone with the link can get in.
//
// Set the key in Cloudflare: Worker → Settings → Variables and Secrets → add a
// Secret named ACCESS_KEY. Change it to lock out everyone who had the old link.

const COOKIE = 'srcai_access';
const YEAR = 60 * 60 * 24 * 365;

const closed = (msg, status = 404) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>AI in your course</title>
<body style="font:17px/1.5 system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 1rem;color:#1f2933">
<h1 style="color:#002F5F;font-size:1.4rem">AI in your course</h1><p>${msg}</p></body>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' } },
);

function hasCookie(request, key) {
  const c = request.headers.get('cookie') || '';
  return c.split(/;\s*/).some((p) => p === `${COOKIE}=${encodeURIComponent(key)}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex' } });
    }
    const key = env.ACCESS_KEY;
    if (!key) return closed('The site is not set up yet: the access key is missing.', 503);

    const given = url.searchParams.get('k');
    if (given !== null) {
      if (given !== key) return closed('This link is not valid. Ask the person who sent it for the current one.', 403);
      url.searchParams.delete('k');
      return new Response(null, {
        status: 302,
        headers: {
          location: url.pathname + url.search,
          'set-cookie': `${COOKIE}=${encodeURIComponent(key)}; Max-Age=${YEAR}; Path=/; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }
    if (!hasCookie(request, key)) return closed('This course is only available through its link. If you are SRC teaching staff, ask Raf Jansen for it.');

    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    out.headers.set('x-robots-tag', 'noindex, nofollow');
    out.headers.set('referrer-policy', 'no-referrer');
    return out;
  },
};
