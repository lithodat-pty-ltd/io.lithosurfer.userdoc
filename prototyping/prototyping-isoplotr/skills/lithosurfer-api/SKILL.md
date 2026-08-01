---
name: lithosurfer-api
description: Call the Lithosurfer / AusGeochem REST API using its Swagger 2.0 documentation. Use when the user asks to talk to the Lithosurfer API, AusGeochem API, fetch or post data via REST, find the right API endpoint, look up a Swagger operation, refresh cached Swagger, query by geographic region (GeoSquare bounds), download/export raw data, navigate sample→datapoint→measurements, or work with `app.ausgeochem.org/api/...`.
---

# Lithosurfer API (AusGeochem)

## Overview

The Lithosurfer / AusGeochem application exposes a JHipster-style REST API documented with **Swagger 2.0**. The API is split into ~21 logical groups (Account, Management, Core Model, per-method analytical data, Admin, …). Each group is its own OpenAPI document.

- **Prod host:** `https://app.ausgeochem.org`
- **Swagger UI:** `https://app.ausgeochem.org/swagger-ui.html`
- **Swagger group index (publicly readable):** `https://app.ausgeochem.org/swagger-resources/`
- **Per-group spec:** `https://app.ausgeochem.org/v2/api-docs/?group=<URL-encoded group name>`

> Use the prod host above unless the user explicitly asks for a different environment. There is no published test host — ask the user if they need one.

## Authentication

The API uses **JWT Bearer auth**. Get a token, then send it on every request.

1. `POST https://app.ausgeochem.org/api/authenticate` with JSON body:
   ```json
   { "username": "<email>", "password": "<password>", "rememberMe": false }
   ```
2. Response: `{ "id_token": "<jwt>" }`
3. Use `Authorization: Bearer <jwt>` on subsequent calls.

Credentials for Hannelore live in `.env`:

```
LITHOSURFER_USER=hannelore.ai@lithodat.com
LITHOSURFER_PASSWORD=<password>
```

If those vars are missing, ask the user before adding them. **Never** commit credentials.

The helper `scripts/call-api.js` (in this skill) handles auth, base URL, and JSON body / query serialization — prefer it over hand-rolled `fetch` calls.

### Identity: who am I?

Two entities represent the logged-in user:

| Entity | Table | Endpoint | Use for |
|---|---|---|---|
| **JHipster user** | `jhi_user` | `GET /api/account` | login, password, email, system authorities |
| **Litho user** | `litho_user` (FK → `jhi_user.id`) | `GET /api/management/litho-users/authenticated-litho-user` | domain identity used by access-control joins (institution, ORCID, etc.) |

`/api/management/litho-users/getAuthenticatedUser` returns the underlying JHipster user, but most domain joins (editor/supervisor/contact) reference `litho_user.id` — **use that id**, not the JHipster `user_id`.

## Authorization & access control

Lithosurfer has **three layers** of authorization. An API call must satisfy all three.

### Layer 1 — System authority (`jhi_authority`)

Coarse-grained role attached to the JHipster user via `jhi_user_authority`. Returned in `GET /api/account` as `authorities`.

| Authority | Meaning | Typical use |
|---|---|---|
| `ROLE_USER` | Default for every activated user | All standard reads/writes within accessible packages |
| `ROLE_CURATOR` | Institution-level curator | Can curate packages owned by their institution |
| `ROLE_ADMIN` | Site admin | Bypasses package-level checks; can call admin-only endpoints |

Most write endpoints require at minimum `ROLE_USER` plus the matching layer-3 membership below. Admin-only routes are concentrated in Swagger group `99 Admin`.

### Layer 2 — Data-package visibility (`data_package.distribution`)

Every analytical artefact (`sample`, `data_point` + all method-specific tables) lives inside exactly one `data_package`. The package's `distribution` field controls **who can see anything from it without explicit membership**:

| Distribution | Visible to | DB count (prod, indicative) |
|---|---|---|
| `PUBLIC` | Anyone (logged-in or not) | ~102 packages |
| `COMMUNITY` | Members of any institution in the package's community | (enum value defined; not yet used in prod) |
| `COMMERCIAL` | Users with a matching `license_assignment` (paid) | ~13 packages |
| `PRIVATE` | Only the package's team (see layer 3) | ~3 600 packages |
| `HIDDEN` | Only admins / package owner | ~15 packages |

Workflow gate: `data_package.workflow_state` ∈ `IN_PROGRESS` / `FINISHED` / `FROZEN`. **`IN_PROGRESS` packages are usually invisible to outsiders even if distribution would otherwise allow it** — Lithosurfer normally publishes only `FINISHED`+. Always include `workflow_state` in mental models when reasoning about visibility.

### Layer 3 — Team membership

For non-`PUBLIC` packages, individual users gain access via three join tables (also exposed as Management endpoints):

| Table | Endpoint | Grants | Role values |
|---|---|---|---|
| `data_package_2_editor` | `/api/management/data-package-2-editors` | **write** to all data in the package | (none — pure membership) |
| `data_package_2_supervisor` | `/api/management/data-package-2-supervisors` | curate/approve, manage editors | (none — pure membership) |
| `data_package_2_user` | `/api/management/DataPackage2User` | read / be notified (no write) | `CONTACT` (~2 100), `SUBSCRIBER` |
| `institution_2_user` | `/api/management/Institution2User` | manage the institution's packages | `CURATOR` (~22) |

Institutions own packages via `institution_2_package` (one institution = primary owner; others can be linked with `l_institution_2_package_role`). Communities aggregate institutions via `institution_2_community`. These layers cascade upward — a community curator can typically reach packages of any institution in their community.

### The `allowedAccess` filter (the single most important access param)

Almost every list/search endpoint accepts `allowedAccess` (as a query param on `GET` and inside the Criteria DTO on `POST /post`). Values:

| Value | Returns |
|---|---|
| `VIEWABLE` | Records the **current JWT** is allowed to view (read) |
| `WRITEABLE` | Records the current JWT is allowed to edit (i.e. user is editor/supervisor) |
| `PREVIEWABLE` | Records the user can preview metadata for (e.g. paid packages they haven't licensed) |
| `VIEWABLE_AND_PREVIEWABLE` | Union of view + preview |

**Pick `allowedAccess` before filtering by `dataPackageId`.** It's the cheapest, most reliable way to scope a query to "what I can actually touch". Filtering by `dataPackageId` alone does **not** override server-side ACLs — the server still strips packages you can't see, you just get a confusingly empty result.

If the query produces an empty list but you expect data:
1. Try `allowedAccess=VIEWABLE` (you might lack write access).
2. Check `GET /api/management/litho-users/accessibledataPackages?allowedAccess=WRITEABLE` to enumerate what your user can write to.
3. Confirm `data_package.workflow_state` allows visibility.

### License / feature gating (commercial)

The license layer is orthogonal to package membership. It controls which **features** a user can use (e.g. paid downloads, bulk export):

```
data_license          ← legal text attached to a data_package
user_license          ← named bundle of features (e.g. "Pro", "Trial")
license_2_feature     ← which features a user_license grants
license_assignment    ← time-bounded grant of a user_license to a
                       litho_user / institution / community
feature               ← individual capability flag (exposed via /api/management/Feature)
```

To answer "what can this user do?":
- `GET /api/management/litho-users/all-available-features` — features unlocked for the current user.
- `GET /api/management/LicenseAssignment?lithoUserId.equals=<id>` — raw license rows.

### Key access-control endpoints (cheat sheet)

| What you want | Endpoint |
|---|---|
| Who am I (JHipster) | `GET /api/account` |
| Who am I (Litho domain) | `GET /api/management/litho-users/authenticated-litho-user` |
| Packages I can read / write | `GET /api/management/litho-users/accessibledataPackages?allowedAccess=VIEWABLE` (or `WRITEABLE`) |
| Am I a curator of institution X? | `GET /api/management/litho-users/is-curator-of-package?institutionId=<id>&userId=<lithoUserId>` |
| My institution memberships | `GET /api/management/Institution2User?lithoUserId.equals=<id>` |
| My editor memberships | `GET /api/management/data-package-2-editors?lithoUserId.equals=<id>` |
| Features I unlock | `GET /api/management/litho-users/all-available-features` |
| Package metadata (incl. distribution + workflow state) | `GET /api/management/data-packages/{id}` |
| Members of a package | `GET /api/management/data-package-2-editors?dataPackageId.equals=<id>` (also `…-supervisors`, `…DataPackage2User`) |

### DB-side ground truth

If the API gives surprising results, you can verify directly against the DB (see the `lithosurfer-datapoint-schema` skill for the join chain). Useful queries:

```sql
-- Which packages can litho_user 42 write to?
SELECT dp.id, dp.name, dp.distribution, dp.workflow_state
FROM data_package dp
WHERE dp.deleted_timestamp IS NULL
  AND (
    dp.id IN (SELECT data_package_id FROM data_package_2_editor   WHERE litho_user_id = 42)
    OR dp.id IN (SELECT data_package_id FROM data_package_2_supervisor WHERE litho_user_id = 42)
    OR dp.institution_id IN (
      SELECT institution_id FROM institution_2_user
      WHERE litho_user_id = 42 AND jhi_role = 'CURATOR'
    )
  );

-- Active license assignments for a user (drives feature flags)
SELECT la.*, ul.name AS license_name
FROM license_assignment la
JOIN user_license ul ON ul.id = la.user_license_id
WHERE la.deleted_timestamp IS NULL
  AND la.litho_user_id = 42
  AND (la.valid_from IS NULL OR la.valid_from <= now())
  AND (la.valid_to   IS NULL OR la.valid_to   >= now());
```

`jhi_user.id` ≠ `litho_user.id`. Translate via `litho_user.user_id = jhi_user.id`.

## API Structure (how to find the right endpoint)

### 1. Path convention

Every business endpoint follows:

```
/api/<area>/<Entity>[/<sub>][/{id}]
```

`<area>` is a short lowercase prefix that corresponds to a Swagger group. The full mapping is in [reference.md](reference.md); the most common are:

| Area prefix | Swagger group | Contains |
|---|---|---|
| `/api/account` | 01 Account | login, register, password, current user |
| `/api/management/` | 02 Management | community, institution, data package, user, license |
| `/api/core/` | 03 Core Model | sample, person, literature, image, lab, machine, vocab, lookup tables (`l-*`, `L*`) |
| `/api/other/` | 04 Other | jobs, snapshots, misc admin-ish |
| `/lithoapi/*_geojson` | 05 Geo Json | GeoJSON feature collections per data type |
| `/api/upb/` | 06 UPb | U-Pb data points, spots, age groups, lookups |
| `/api/vitrinite/` | 07 Vitrinite Data | vitrinite reflectance |
| `/api/age/` | 08 Age Data | generic age datapoints |
| `/api/fissiontrack/` | 09 Fission Track Data | FT data points, grains, lengths, lookups |
| `/api/helium/` | 10 Helium Data | (U-Th)/He |
| `/api/geochem/` | 11 Geochem Data | elemental/oxide concentrations, GC data points |
| `/api/icpms/` | 12 ICPMS | ICP-MS sessions/runs |
| `/api/shrimp/` | 13 SHRIMP Data | SHRIMP-specific |
| `/api/th/` | 14 Thermal History | thermal-history models |
| `/api/iso/` | 15 Isotopes | generic isotopes |
| `/api/arar/` | 16 ArAr | Ar-Ar |
| `/api/deposit/` | 17 Deposits | mineral deposits |
| `/api/luhf/` | 18 Lu-Hf | Lu-Hf |
| `/api/pbisotope/` | 19 Pb-Isotope | Pb isotopes |
| `/api/srisotope/` | 20 Sr-Isotope | Sr isotopes |
| (everything) | 99 Admin | aggregates all paths — useful as a catch-all when you can't guess the group |

> When in doubt, **search Group `99 Admin`** — it contains every endpoint in one document (~1900 paths) and is the safest place to grep.

### 2. Standard endpoints per entity

Most entities expose this CRUD/search surface (e.g. `/api/core/Person`):

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/<area>/<Entity>` | list with query-string filters (paginated) |
| `POST` | `/api/<area>/<Entity>` | create (entity DTO in body) |
| `PUT` | `/api/<area>/<Entity>` | update (entity DTO in body, includes `id`) |
| `GET` | `/api/<area>/<Entity>/{id}` | get by id |
| `DELETE` | `/api/<area>/<Entity>/{id}` | delete by id |
| `GET` | `/api/<area>/<Entity>/count` | count with query-string filters |
| `POST` | `/api/<area>/<Entity>/post` | list with **Criteria DTO** in body (recommended for complex filters) |
| `POST` | `/api/<area>/<Entity>/count/post` | count with Criteria DTO in body |

Some entities also expose `/bulk`, `/download/post`, `/findIds/post`, `/deleteByCriteria`, `/move`, `/raw`, or geo-specific endpoints like `/findGeoSquare/post`. Inspect the cached Swagger for the exact set. How to use them: [geo-queries.md](geo-queries.md), [download-and-export.md](download-and-export.md).

**Always set `allowedAccess`** on list/search calls when you care about what _you_ can see vs. what exists in the DB. See [Authorization & access control](#authorization--access-control) above.

### 3. Filtering (JHipster pattern)

**On GET endpoints** you append filter operators to the column name as query params:

```
GET /api/core/sample-with-locations?id.in=1,2,3&igsn.contains=ABC&deletedTimestamp.specified=false
```

Operators by field type:

| Filter type | Operators |
|---|---|
| `StringFilter` | `equals`, `contains`, `in`, `specified` |
| `LongFilter` / `IntegerFilter` | `equals`, `in`, `greaterThan`, `greaterOrEqualThan`, `lessThan`, `lessOrEqualThan`, `specified` |
| `InstantFilter` / `LocalDateFilter` | same as Long (date strings in ISO 8601) |
| `BooleanFilter` | `equals`, `specified` |

**On `/post` endpoints** you send the same logic as a JSON body:

```http
POST /api/core/sample-with-locations/post?page=0&size=100&sort=id,asc
Content-Type: application/json

{
  "igsn":  { "contains": "ABC" },
  "id":    { "in": [1, 2, 3] },
  "deletedTimestamp": { "specified": false }
}
```

The body schema is named `<Entity>LithoCriteria` (or `<Entity>Criteria`) in the Swagger `definitions`.

### 4. Pagination & sorting

- Query params on list endpoints: `page` (0-based), `size`, `sort=<field>,<asc|desc>` (repeatable).
- `X-Total-Count` response header gives the total row count.

## Working with the Swagger (cache + search)

The full set of Swagger docs is ~7 MB. This skill keeps a local cache in `cache/` so agents can grep through specs without re-downloading.

### Cache layout

```
.cursor/skills/lithosurfer-api/cache/
├── _index.json                    # group → file + fetchedAt
├── 01 Account.json
├── 02 Management.json
├── 03 Core Model.json
├── ...
└── 99 Admin.json
```

The `cache/` directory is gitignored (see `cache/.gitignore`) — these files are large and change with each deploy.

### Refresh the cache

```bash
node .cursor/skills/lithosurfer-api/scripts/fetch-swagger.js
```

Re-run when:
- the cache is missing or older than ~7 days,
- the user reports a 404 / unknown field on an endpoint that should exist,
- the user explicitly says the API was updated.

> **Staleness warning.** Cached Swagger is a snapshot. Lithosurfer ships new endpoints regularly. **Always** check `cache/_index.json` for `fetchedAt`. If a search comes up empty or a request 404s on something that should exist, refresh the cache **before** assuming the endpoint is gone.

### Search the cache

```bash
# Find any path / operationId / tag / definition matching a keyword
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "<keyword>" [--group "<group name>"] [--what paths|ops|defs|tags|all]
```

Examples:

```bash
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js Person
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "igsn" --what paths
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "FTDataPoint" --group "09 Fission Track Data"
```

The script prints the matching path + HTTP methods + operationId so the next step is obvious. Once you have a path, you can read the full operation details directly from the cached JSON.

## Calling the API

### Quick helper

`scripts/call-api.js` is a thin wrapper around `fetch` that handles JWT auth, base URL, and pretty JSON output.

```bash
# Token is cached at .cursor/skills/lithosurfer-api/cache/.token (gitignored)
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  GET "/api/core/Person?id.equals=42"

node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/post?page=0&size=5" \
  --body '{"igsn": {"contains": "10273"}}'
```

Flags:
- `--env prod` (default — only env supported today)
- `--body '<json>'` or `--body-file <path.json>`
- `--raw` to print raw response instead of pretty JSON

### Programmatic use

```javascript
const { call, getToken } = require('.cursor/skills/lithosurfer-api/scripts/call-api');

const token = await getToken();
const samples = await call('POST', '/api/core/sample-with-locations/post?page=0&size=100', {
  body: { igsn: { contains: 'ABC' } },
  token,
});
```

## Agent workflows (read these for task execution)

| User intent | Doc |
|---|---|
| Understand sample → datapoint → measurements; hydrate by id | [domain-model.md](domain-model.md) |
| Find data in a geographic region; GeoSquare vs bounds filter; GeoJSON | [geo-queries.md](geo-queries.md) |
| Download / export large selections (raw, CSV, 50k limit, shapefile) | [download-and-export.md](download-and-export.md) |
| Swagger group → path map | [reference.md](reference.md) |
| DB join chain (SQL / Metabase) | `.cursor/skills/lithosurfer-datapoint-schema/SKILL.md` |
| Import / batch write | `.cursor/skills/lithosurfer-import/SKILL.md`, `bulk-geochem-import` |

**Default execution loop for any data question:**

```
1. Refresh/search Swagger if the endpoint is unclear (see below)
2. Authenticate via call-api.js
3. Set allowedAccess on every search
4. count/post before large pulls
5. Use geo bounds / package / id filters as needed
6. Prefer findIds + hydrate or /download/post over huge paginated DTO walks
```

## Recipes

### Authenticate + fetch current account

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js GET /api/account
node .cursor/skills/lithosurfer-api/scripts/call-api.js GET /api/management/litho-users/authenticated-litho-user
```

### List data packages I can write to

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  GET "/api/management/litho-users/accessibledataPackages?allowedAccess=WRITEABLE"
```

### Find a sample by IGSN (scoped to what I can view)

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/post?page=0&size=10" \
  --body '{"allowedAccess": "VIEWABLE", "igsn": {"equals": "10273/XXAB00001"}}'
```

### Samples in a geographic region

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/post?page=0&size=100" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5, "leftBound": 144.0,
    "upperBound": -37.5, "rightBound": 145.5
  }'
```

More (count, findIds, fit-bounds, GeoJSON): [geo-queries.md](geo-queries.md).

### Download raw rows for a selection (≤ 50 000)

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/count/post" \
  --body '{"allowedAccess": "VIEWABLE", "dataPackageId": {"equals": 123}}'

node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/download/post?format=json" \
  --body '{"allowedAccess": "VIEWABLE", "dataPackageId": {"equals": 123}}'
```

CSV / chunking / child measurements: [download-and-export.md](download-and-export.md).

### Count fission-track data points in a data package

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/fissiontrack/FTDataPoint/count/post" \
  --body '{"dataPackageId": {"equals": 123}}'
```

### Look up a lookup-table value (e.g. mineral material)

Lookup tables live under `/api/core/L<Name>` (admin/lookup, prefix `L`) or `/api/core/l-<name>` (resource-style). Examples: `/api/core/LUnit`, `/api/core/l-sample-kinds`, `/api/core/l-country`.

## Conventions and gotchas

- **PascalCase vs kebab-case.** Some resources use PascalCase paths (`/api/core/Person`, `/api/fissiontrack/FTDataPoint`); others use kebab-case (`/api/core/sample-with-locations`, `/api/core/l-sample-kinds`). Don't normalize — copy the exact path from Swagger.
- **GC FK quirk.** The geochem FK on `data_point` is `gcdata_point_id` (no underscore), not `gc_data_point_id`. See the `lithosurfer-datapoint-schema` skill for the full method → table map.
- **GeoJSON endpoints live under `/lithoapi/`, not `/api/`.** They're documented in Swagger group `05 Geo Json`.
- **99 Admin is the union of everything.** Use it as the search-of-last-resort, not as the canonical home of an endpoint.
- **Trailing slash on `/v2/api-docs/`.** `app.ausgeochem.org` redirects `/v2/api-docs?…` → `/v2/api-docs/?…`. The fetch script follows the redirect; curl callers should pass `-L`.
- **Don't confuse with the DB schema.** The API exposes DTOs, not raw tables. Field names usually match but joins/derived fields can differ. For raw SQL questions, use the `lithosurfer-datapoint-schema` skill.

## Additional resources

- [domain-model.md](domain-model.md) — sample → datapoint → measurements; hydration.
- [geo-queries.md](geo-queries.md) — regional filters, `findGeoSquare`, GeoJSON.
- [download-and-export.md](download-and-export.md) — raw/CSV download, 50k guard, shapefile.
- [reference.md](reference.md) — full group → path-prefix map and group descriptions.
- `scripts/fetch-swagger.js` — refresh local Swagger cache.
- `scripts/search-swagger.js` — search cached Swagger for paths, operations, definitions, tags.
- `scripts/call-api.js` — authenticated REST client (CLI + library).
