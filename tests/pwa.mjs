import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const handlers = {};
const stores = new Map([['study-garden-old', new Map()], ['unrelated-cache', new Map()]]);
let online = true, claimed = false, skipped = false;
const fetched = [];
const origin = 'https://garden.example';
const key = value => new URL(typeof value === 'string' ? value : value.url, origin).href;
const cacheApi = name => {
  if (!stores.has(name)) stores.set(name, new Map());
  const items = stores.get(name);
  return {
    async addAll(urls) { for (const url of urls) items.set(key(url), new Response('cached:' + url)); },
    async match(request) { return items.get(key(request))?.clone(); },
    async put(request, response) { items.set(key(request), response.clone()); },
  };
};
const self = {
  location: new URL(origin), clients: { async claim() { claimed = true; } },
  skipWaiting() { skipped = true; }, addEventListener(name, handler) { handlers[name] = handler; },
};
const source = readFileSync('scripts/service-worker.js', 'utf8')
  .replace('__BUILD_VERSION__', 'test').replace('__PRECACHE_ASSETS__', JSON.stringify(['/', '/offline.html', '/_next/static/app.js']));
vm.runInNewContext(source, {
  self, URL, Response,
  caches: { async open(name) { return cacheApi(name); }, async keys() { return [...stores.keys()]; }, async delete(name) { return stores.delete(name); } },
  async fetch(request) { if (!online) throw new Error('offline'); fetched.push(key(request)); return { status: 200, type: 'basic', clone() { return new Response('network:' + key(request)); } }; },
});
async function lifecycle(name) { let done; handlers[name]({ waitUntil(p) { done = p; } }); await done; }
await lifecycle('install'); assert(!skipped, 'updates must not force activation');
await lifecycle('activate'); assert(claimed); assert(!stores.has('study-garden-old')); assert(stores.has('unrelated-cache'));
async function request(path, options = {}) {
  let result;
  handlers.fetch({ request: { url: new URL(path, origin).href, method: 'GET', mode: 'cors', headers: new Headers(), ...options }, respondWith(p) { result = p; } });
  return result === undefined ? undefined : await result;
}
online = false;
assert.equal(await (await request('/?source=app', { mode: 'navigate' })).text(), 'cached:/');
assert.equal(await (await request('/_next/static/app.js')).text(), 'cached:/_next/static/app.js');
assert.equal((await request('/ir/missing.pdf')).status, 503);
assert.equal(await request('/?_rsc=test'), undefined);
assert.equal(await request('/', { headers: new Headers({ RSC: '1' }) }), undefined);
assert.equal(await request('/api/private'), undefined);
assert.equal(await request('/notes', { method: 'POST' }), undefined);
assert.equal(await request('https://external.example/map.png'), undefined);
online = true;
await request('/ir/maps/central.png');
online = false;
assert.equal(await (await request('/ir/maps/central.png')).text(), 'network:' + origin + '/ir/maps/central.png');
handlers.message({ data: { type: 'SKIP_WAITING' } }); assert(skipped);
console.log('PWA checks passed: offline reopen, static files, viewed maps, update control, API/RSC/POST/cross-origin exclusions, scoped cache cleanup.');
