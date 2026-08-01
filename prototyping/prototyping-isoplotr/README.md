# IsoplotR prototyping kit

Standalone **read-only** tool for trying LithoSurfer → IsoplotR mappings against **PROD** (`app.ausgeochem.org`), without changing EarthBank / client100.

```
login → enter parent IDs → choose mapping options → open isoplotr.lithodat.com
```

## For geologists

1. Create a **dedicated AI / automation user** (`ROLE_USER`) with read access to the packages you will test. Prefer this over your personal password.
2. Install [Node.js 20+](https://nodejs.org/).
3. In this folder:

```bash
npm install
npm run dev
```

4. Open the URL Vite prints (usually `http://localhost:5173`).
5. Sign in, paste e.g. `UPbDataPoint` ids, pick format, **Open IsoplotR**.

JWT stays in `sessionStorage` only. The app never writes to PROD.

## For AI agents

Read **`AGENT.md`** in this folder. The base app already works for **U-Pb**. Extend via `src/methods/` (Ar-Ar / FT stubs are placeholders).

LithoSurfer / AusGeochem API docs and helper scripts are bundled under **`skills/lithosurfer-api/`** — start with `skills/lithosurfer-api/SKILL.md`.

## Layout

| Path | Role |
|------|------|
| `src/main.js` | UI flow |
| `src/auth.js` / `api.js` / `openIsoplotR.js` | PROD auth, fetch, form POST |
| `src/lib/mapUPbSpots.ts` | Production-grade U-Pb mapper (ported from client100) |
| `fixtures/sessionTemplate.json` | Full IsoplotRgui session skeleton |
| `src/methods/registry.js` | Plug in new methods here |
| `vite.config.js` | Proxies `/api` → PROD (avoids CORS) |

## Safety

- PROD is live data visibility — the AI user only sees packages it can access.
- Do not commit passwords or JWTs.
- When a mapping is proven, ask engineering to port it into `io.lithosurfer.client100`.
