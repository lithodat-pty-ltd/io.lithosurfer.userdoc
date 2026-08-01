#!/usr/bin/env node
/**
 * Authenticated REST client for the Lithosurfer / AusGeochem API.
 *
 * CLI:
 *   node call-api.js <METHOD> <PATH> [--body '<json>' | --body-file <file>]
 *                                     [--host <url>] [--raw] [--no-token-cache]
 *
 * Examples:
 *   node call-api.js GET /api/account
 *   node call-api.js POST "/api/core/sample-with-locations/post?page=0&size=5" \
 *        --body '{"igsn":{"contains":"10273"}}'
 *
 * Library:
 *   const { getToken, call } = require('./call-api');
 *   const token = await getToken();
 *   const out = await call('GET', '/api/account', { token });
 *
 * Auth: reads LITHOSURFER_USER / LITHOSURFER_PASSWORD from the project .env.
 * Token cache: cache/.token (gitignored). Refreshed automatically when stale.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..', '..');
try {
  require('dotenv').config({ path: path.join(ROOT_DIR, '.env') });
} catch {
  // dotenv is optional when env vars are already set
}

const DEFAULT_HOST = 'https://app.ausgeochem.org';
const TOKEN_FILE = path.resolve(__dirname, '..', 'cache', '.token');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function readCachedToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  try {
    const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    if (Date.now() - cached.issuedAt > TOKEN_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedToken(host, token) {
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(
    TOKEN_FILE,
    JSON.stringify({ host, token, issuedAt: Date.now() }, null, 2),
    { mode: 0o600 },
  );
}

async function authenticate(host) {
  const username = process.env.LITHOSURFER_USER;
  const password = process.env.LITHOSURFER_PASSWORD;
  if (!username || !password) {
    throw new Error(
      'LITHOSURFER_USER and LITHOSURFER_PASSWORD must be set in .env',
    );
  }
  const res = await fetch(`${host}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password, rememberMe: false }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Auth failed: HTTP ${res.status} ${res.statusText} — ${body}`);
  }
  const json = await res.json();
  const token = json.id_token;
  if (!token) throw new Error(`Auth response missing id_token: ${JSON.stringify(json)}`);
  return token;
}

/**
 * Returns a JWT. Uses cache unless { fresh: true } or { useCache: false }.
 * @param {{ host?: string, fresh?: boolean, useCache?: boolean }} opts
 */
async function getToken(opts = {}) {
  const host = opts.host || DEFAULT_HOST;
  const useCache = opts.useCache !== false && !opts.fresh;
  if (useCache) {
    const cached = readCachedToken();
    if (cached && cached.host === host) return cached.token;
  }
  const token = await authenticate(host);
  if (opts.useCache !== false) writeCachedToken(host, token);
  return token;
}

/**
 * Call a Lithosurfer API endpoint.
 * @param {string} method
 * @param {string} apiPath - starts with /
 * @param {{ host?: string, body?: any, query?: object, token?: string, raw?: boolean, headers?: object }} opts
 * @returns {Promise<any>} parsed JSON, text, or raw Response (if raw=true)
 */
async function call(method, apiPath, opts = {}) {
  const host = opts.host || DEFAULT_HOST;
  const token = opts.token || (await getToken({ host }));

  let url = `${host}${apiPath}`;
  if (opts.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.query)) {
      if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
      else if (v !== undefined && v !== null) qs.append(k, v);
    }
    url += (url.includes('?') ? '&' : '?') + qs.toString();
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(opts.headers || {}),
  };
  let body;
  if (opts.body !== undefined) {
    body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(url, { method, headers, body });

  if (opts.raw) return res;

  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const err = new Error(`${method} ${apiPath} → HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

function parseCliArgs(argv) {
  const args = { method: null, path: null, host: null, body: undefined, raw: false, useCache: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--body') args.body = argv[++i];
    else if (a === '--body-file') args.body = fs.readFileSync(argv[++i], 'utf8');
    else if (a === '--host') args.host = argv[++i];
    else if (a === '--raw') args.raw = true;
    else if (a === '--no-token-cache') args.useCache = false;
    else if (a === '-h' || a === '--help') {
      console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).join('\n'));
      process.exit(0);
    } else if (!args.method) args.method = a.toUpperCase();
    else if (!args.path) args.path = a;
    else throw new Error(`Unexpected arg: ${a}`);
  }
  if (!args.method || !args.path) {
    console.error('Usage: call-api.js <METHOD> <PATH> [--body <json>|--body-file <file>] [--host <url>] [--raw]');
    process.exit(2);
  }
  return args;
}

async function cli() {
  const args = parseCliArgs(process.argv);
  const token = await getToken({ host: args.host || undefined, useCache: args.useCache });

  if (args.raw) {
    const res = await call(args.method, args.path, {
      host: args.host || undefined,
      body: args.body,
      token,
      raw: true,
    });
    console.log(`HTTP ${res.status} ${res.statusText}`);
    for (const [k, v] of res.headers) console.log(`${k}: ${v}`);
    console.log();
    console.log(await res.text());
    return;
  }

  const body = args.body !== undefined ? safeParseJson(args.body) : undefined;
  try {
    const out = await call(args.method, args.path, {
      host: args.host || undefined,
      body,
      token,
    });
    if (typeof out === 'string') console.log(out);
    else console.log(JSON.stringify(out, null, 2));
  } catch (err) {
    console.error(err.message);
    if (err.payload !== undefined) console.error(JSON.stringify(err.payload, null, 2));
    process.exit(1);
  }
}

function safeParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

if (require.main === module) {
  cli().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

module.exports = { getToken, call };
