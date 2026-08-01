/** IsoplotRgui ingest — always form POST, never fetch (CORS). */
export const ISOPLOTR_INIT_URL = 'https://isoplotr.lithodat.com/init'

/** Hard caps — same spirit as production EarthBank handoff. */
export const MAX_PARENT_IDS = 20
export const MAX_CHILD_ROWS = 500

/**
 * API base. In `npm run dev`, Vite proxies `/api` → https://app.ausgeochem.org
 * so leave this empty. Override only if you know what you are doing.
 */
export const API_BASE = ''
