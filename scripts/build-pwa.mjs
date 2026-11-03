import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const template = await readFile('scripts/service-worker.js', 'utf8');
const base = ['/', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png'];
const render = (version, assets) => template.replace('__BUILD_VERSION__', version).replace('__PRECACHE_ASSETS__', JSON.stringify(assets));
// Reserve the public path before Next collects assets for deployment.
await writeFile('public/sw.js', render('preparing', base));
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const files = (await readdir('.next/static', { recursive: true })).filter(path => /\.(js|css|woff2?)$/.test(path)).sort();
const assets = [...base, ...files.map(path => '/_next/static/' + path.replaceAll('\\', '/'))];
const buildId = (await readFile('.next/BUILD_ID', 'utf8')).trim();
const version = createHash('sha256').update(buildId + template + JSON.stringify(assets)).digest('hex').slice(0, 16);
await writeFile('public/sw.js', render(version, assets));
console.log(`PWA ready: ${assets.length} offline assets (${version})`);
