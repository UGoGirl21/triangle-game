import assert from 'node:assert/strict';

// Check the deployed HTML without running JavaScript, like an initial crawler fetch.
const origin = (process.argv[2] || 'https://triangle-game-one.vercel.app').replace(/\/$/, '');
const routes = ['/', '/how-to-play', '/strategy', '/daily-challenge', '/faq', '/about', '/privacy', '/terms', '/contact'];
const titles = new Set();
let failures = 0;

async function readRoute(route) {
  const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${route}: HTTP status`);
  assert.doesNotMatch(response.headers.get('x-robots-tag') || '', /noindex/i, `${route}: indexing header`);
  return response.text();
}

const results = await Promise.allSettled(routes.map(async (route) => {
  const html = await readRoute(route);
  assert.match(html, /<h1[ >]/, `${route}: initial HTML heading`);
  assert.match(html, /<nav /, `${route}: navigation links`);
  assert.ok(html.includes(`href="${origin}${route === '/' ? '/' : route}"`), `${route}: canonical URL`);
  assert.doesNotMatch(html, /<meta\s+name="robots"\s+content="[^"]*noindex/i, `${route}: indexing meta tag`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${route}: unique title`);
  titles.add(title);
  if (route === '/strategy') assert.ok(html.includes('세 수 앞까지'), 'Updated puzzle is deployed');
  if (route === '/daily-challenge') assert.ok(html.includes('참여와 기록'), 'Updated daily instructions are deployed');
  return `${route}: OK`;
}));
for (const result of results) {
  if (result.status === 'fulfilled') console.log(result.value);
  else { failures += 1; console.error(result.reason.message); }
}

try {
  const robots = await readRoute('/robots.txt');
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'Sitemap declared in robots.txt');
  assert.doesNotMatch(robots, /Disallow:\s*\/\s*$/m, 'Whole site is not blocked');
  const sitemap = await readRoute('/sitemap.xml');
  for (const route of routes) assert.ok(sitemap.includes(`<loc>${origin}${route}</loc>`), `${route}: sitemap entry`);
  const ads = await readRoute('/ads.txt');
  assert.ok(ads.includes('pub-7567499860052994'), 'Publisher ID in ads.txt');
  console.log('robots.txt, sitemap.xml, ads.txt: OK');
} catch (error) { failures += 1; console.error(error.message); }

if (failures) process.exitCode = 1;
else console.log('Initial HTML checks passed. Search indexing and AdSense approval still require account review.');
