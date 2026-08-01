#!/usr/bin/env node
/**
 * Search the cached Swagger for paths, operationIds, tags, or definition names
 * matching a keyword. Prints matches grouped by Swagger group.
 *
 * Usage:
 *   node search-swagger.js <keyword> [--group "<group name>"] [--what paths|ops|defs|tags|all]
 *
 * Examples:
 *   node search-swagger.js Person
 *   node search-swagger.js igsn --what paths
 *   node search-swagger.js FTDataPoint --group "09 Fission Track Data"
 *
 * Notes:
 *   - keyword match is case-insensitive substring.
 *   - if cache is missing, run scripts/fetch-swagger.js first.
 *   - the cache is a snapshot; refresh if results look wrong.
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '..', 'cache');
const INDEX_FILE = path.join(CACHE_DIR, '_index.json');

function parseArgs(argv) {
  const args = { keyword: null, group: null, what: 'all' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--group') args.group = argv[++i];
    else if (a === '--what') args.what = argv[++i];
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 18).join('\n'));
      process.exit(0);
    } else if (!args.keyword) args.keyword = a;
    else throw new Error(`Unexpected arg: ${a}`);
  }
  if (!args.keyword) {
    console.error('Usage: search-swagger.js <keyword> [--group <name>] [--what paths|ops|defs|tags|all]');
    process.exit(2);
  }
  if (!['paths', 'ops', 'defs', 'tags', 'all'].includes(args.what)) {
    throw new Error(`--what must be one of: paths, ops, defs, tags, all`);
  }
  return args;
}

function loadIndex() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.error(`No cache found at ${INDEX_FILE}`);
    console.error('Run: node scripts/fetch-swagger.js');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

function ageDays(iso) {
  return ((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)).toFixed(1);
}

function searchGroup(spec, keyword, what) {
  const kw = keyword.toLowerCase();
  const hits = { paths: [], ops: [], defs: [], tags: [] };

  if (what === 'paths' || what === 'ops' || what === 'all') {
    for (const [p, methods] of Object.entries(spec.paths || {})) {
      const pathMatches = p.toLowerCase().includes(kw);
      const methodList = [];
      for (const [m, op] of Object.entries(methods)) {
        if (typeof op !== 'object' || op === null) continue;
        const opMatches =
          (op.operationId || '').toLowerCase().includes(kw) ||
          (op.summary || '').toLowerCase().includes(kw) ||
          (op.tags || []).some((t) => t.toLowerCase().includes(kw));
        methodList.push({ method: m.toUpperCase(), op, matches: opMatches });
      }
      if (pathMatches && (what === 'paths' || what === 'all')) {
        hits.paths.push({ path: p, methods: methodList });
      }
      if (what === 'ops' || what === 'all') {
        const opMatches = methodList.filter((x) => x.matches);
        if (opMatches.length && !pathMatches) {
          hits.ops.push({ path: p, methods: opMatches });
        }
      }
    }
  }

  if (what === 'defs' || what === 'all') {
    for (const name of Object.keys(spec.definitions || {})) {
      if (name.toLowerCase().includes(kw)) hits.defs.push(name);
    }
  }

  if (what === 'tags' || what === 'all') {
    for (const t of spec.tags || []) {
      if (t.name.toLowerCase().includes(kw)) hits.tags.push(t.name);
    }
  }

  return hits;
}

function formatHits(groupName, hits) {
  const lines = [];
  const total =
    hits.paths.length + hits.ops.length + hits.defs.length + hits.tags.length;
  if (!total) return null;
  lines.push(`\n=== ${groupName} ===`);

  if (hits.paths.length) {
    lines.push(`Paths (${hits.paths.length}):`);
    for (const { path, methods } of hits.paths) {
      const ms = methods.map((m) => m.method).join(',');
      lines.push(`  ${ms.padEnd(20)}  ${path}`);
    }
  }
  if (hits.ops.length) {
    lines.push(`Operations matching keyword (${hits.ops.length}):`);
    for (const { path, methods } of hits.ops) {
      for (const m of methods) {
        const opId = m.op.operationId || '';
        const summary = m.op.summary || '';
        lines.push(`  ${m.method.padEnd(6)} ${path}  → ${opId}  "${summary}"`);
      }
    }
  }
  if (hits.defs.length) {
    lines.push(`Definitions (${hits.defs.length}): ${hits.defs.join(', ')}`);
  }
  if (hits.tags.length) {
    lines.push(`Tags (${hits.tags.length}): ${hits.tags.join(', ')}`);
  }
  return lines.join('\n');
}

function main() {
  const { keyword, group, what } = parseArgs(process.argv);
  const index = loadIndex();

  console.log(
    `Searching cached Swagger for "${keyword}" (cache age: ${ageDays(
      index.fetchedAt,
    )}d, host: ${index.host})`,
  );
  if (Number(ageDays(index.fetchedAt)) > 7) {
    console.log('  ! Cache is older than 7 days — consider running fetch-swagger.js');
  }

  const groups = group
    ? index.groups.filter((g) => g.name === group)
    : index.groups;

  if (group && groups.length === 0) {
    console.error(`Unknown group "${group}". Available: ${index.groups.map((g) => g.name).join(', ')}`);
    process.exit(1);
  }

  let totalHits = 0;
  for (const g of groups) {
    const spec = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, g.file), 'utf8'));
    const hits = searchGroup(spec, keyword, what);
    const formatted = formatHits(g.name, hits);
    if (formatted) {
      console.log(formatted);
      totalHits +=
        hits.paths.length + hits.ops.length + hits.defs.length + hits.tags.length;
    }
  }
  console.log(`\nTotal matches: ${totalHits}`);
}

main();
