#!/usr/bin/env node
/**
 * Fetch the full Lithosurfer Swagger documentation and cache each group as JSON
 * in the sibling `cache/` directory.
 *
 * Usage:
 *   node fetch-swagger.js                  # fetch all groups
 *   node fetch-swagger.js --host <url>     # override host (default: https://app.ausgeochem.org)
 *   node fetch-swagger.js --group "<name>" # fetch a single group (repeatable)
 *   node fetch-swagger.js --force          # re-fetch even if cached < 7d ago
 *
 * Writes:
 *   cache/<group>.json
 *   cache/_index.json   ({ host, fetchedAt, groups: [{ name, file, paths, tags, fetchedAt }] })
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_HOST = 'https://app.ausgeochem.org';
const CACHE_DIR = path.resolve(__dirname, '..', 'cache');
const INDEX_FILE = path.join(CACHE_DIR, '_index.json');
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

function parseArgs(argv) {
  const args = { host: DEFAULT_HOST, groups: [], force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--host') args.host = argv[++i];
    else if (a === '--group') args.groups.push(argv[++i]);
    else if (a === '--force') args.force = true;
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 16).join('\n'));
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return args;
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return res.json();
}

function loadIndex() {
  if (!fs.existsSync(INDEX_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const { host, groups: requested, force } = parseArgs(process.argv);

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  console.log(`Fetching Swagger group index from ${host}/swagger-resources/`);
  const resources = await getJSON(`${host}/swagger-resources/`);
  if (!Array.isArray(resources) || resources.length === 0) {
    throw new Error('swagger-resources/ returned no groups');
  }

  const wanted = requested.length
    ? resources.filter((r) => requested.includes(r.name))
    : resources;

  if (requested.length && wanted.length !== requested.length) {
    const missing = requested.filter((n) => !resources.find((r) => r.name === n));
    throw new Error(`Unknown group(s): ${missing.join(', ')}`);
  }

  const prevIndex = loadIndex();
  const prevByName = new Map((prevIndex?.groups || []).map((g) => [g.name, g]));
  const now = Date.now();

  const out = [];
  for (const r of wanted) {
    const filename = `${r.name}.json`;
    const filepath = path.join(CACHE_DIR, filename);
    const prev = prevByName.get(r.name);
    const stale = !prev || force || now - new Date(prev.fetchedAt).getTime() > STALE_MS || !fs.existsSync(filepath);

    if (!stale) {
      console.log(`  · ${r.name} — cached (${prev.paths} paths)`);
      out.push(prev);
      continue;
    }

    const url = `${host}${r.url}`;
    process.stdout.write(`  ↓ ${r.name} ... `);
    const spec = await getJSON(url);
    fs.writeFileSync(filepath, JSON.stringify(spec));
    const paths = Object.keys(spec.paths || {}).length;
    const tags = (spec.tags || []).length;
    console.log(`${paths} paths, ${tags} tags`);
    out.push({
      name: r.name,
      file: filename,
      sourceUrl: url,
      paths,
      tags,
      fetchedAt: new Date().toISOString(),
    });
  }

  const index = {
    host,
    fetchedAt: new Date().toISOString(),
    groups: out.sort((a, b) => a.name.localeCompare(b.name)),
  };
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  console.log(`\nWrote ${INDEX_FILE}`);
  console.log(`Cached ${out.length} group(s) in ${CACHE_DIR}`);
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
