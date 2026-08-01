# Download, raw rows, and large selections

How to pull larger result sets without paging through UI-sized `/post` lists.

## Endpoint roles

| Endpoint | Returns | Use when |
|---|---|---|
| `POST …/post?page=&size=` | Typed DTOs, paginated | Browse / small pages (default `size` often 20) |
| `POST …/count/post` | `Long` | Check size before download |
| `POST …/findIds/post` | `Long[]` | Cheap id set for hydrate or follow-up filters |
| `GET\|POST …/raw[/post]` | `List<Map<String,Object>>` paginated | Flat “spreadsheet” rows, still paginated |
| `POST …/download/post` | All matching raw rows as **JSON** or **CSV** | One-shot export of a selection |
| `GET\|POST …/downloadShapefile[/post]` | ZIP shapefile | GIS export of the selection |
| `GET /api/core/hydrate-*-by-id` | Nested DTOs | Expand known ids |

Not every entity has every variant — search Swagger:

```bash
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "download/post" --what paths
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "/raw" --what paths
```

## Hard limit: 50 000 rows

`/download/post` is guarded by `RawDownloadGuard.MAX_RAW_DOWNLOAD_ROWS = 50000`.

- Server counts the criteria first; if `total > 50000` → **HTTP 413** with message to narrow the selection.
- Client UIs may disable export earlier; the API enforces 50k regardless.
- **Strategy for >50k:** split by package, by geo bounds tiles, by `id` ranges, or by method child tables; download each chunk separately.

Always `count/post` first.

## Recipe: download samples in a region (JSON)

```bash
# 1) Count
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/count/post" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5, "leftBound": 144.0,
    "upperBound": -37.5, "rightBound": 145.5
  }'

# 2) Download (default format=json) — only if count ≤ 50000
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/download/post?format=json" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5, "leftBound": 144.0,
    "upperBound": -37.5, "rightBound": 145.5
  }'
```

CSV:

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/download/post?format=csv" \
  --body '{ …same criteria… }' \
  --raw
```

(`--raw` keeps binary/text bodies intact when not JSON.)

Optional `blacklist` query param: list of column names to omit from raw rows.

## Recipe: download method data points, then measurements

```
Region / package criteria
  → count GCDataPoint
  → download/post GCDataPoint   (or findIds + hydrate-gc-by-id)
  → for concentrations: download/post ElementalConcentration / OxideConcentration
       filtered by gCDataPointId.in = […]
```

Example — GC data points in a package:

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/GCDataPoint/count/post" \
  --body '{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }'

node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/GCDataPoint/download/post?format=json" \
  --body '{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }'
```

Example — elemental concentrations for known GC ids (chunk if many):

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/ElementalConcentration/download/post?format=csv" \
  --body '{ "gCDataPointId": { "in": [99001, 99002, 99003] } }' \
  --raw
```

Same pattern for FT lengths, U-Pb spots, etc. — find the child resource’s `/download/post` in Swagger.

## Recipe: ids → hydrated objects

When you need nested structure rather than flat export rows:

```bash
# ids from findIds
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/findIds/post" \
  --body '{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }'

# hydrate (comma-separated)
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  GET "/api/core/hydrate-samples-by-id?sampleIds=1,2,3"
```

For method payloads: `hydrate-gc-by-id`, `hydrate-fissionTrack-by-id`, `hydrate-upb-by-id`, … (see [domain-model.md](domain-model.md)).

## Raw vs download

- **`/raw` + pageable** — stream in pages (`page`, `size`); good for custom agents that want progress / memory control.
- **`/download/post`** — server loads **all** matching rows in one response (still capped at 50k). Prefer this for “give me the file” tasks under the limit.

Both return flat `Map` rows (joined aliases for sample name, datapoint name, analyte, …), not the full nested create-DTO graph.

## Shapefile

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/downloadShapefile/post" \
  --body '{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }' \
  --raw
```

Also available on several method data-point resources. Returns `application/octet-stream` ZIP.

## Scaling playbook (>50k or heavy nested trees)

1. **Count** at each level (samples, datapoints, children).
2. **Partition** criteria: `dataPackageId`, geo tiles, `id.greaterThan` / `id.lessThan`, or `id.in` chunks of a few thousand.
3. **Prefer findIds → chunked download/hydrate** over one giant nested walk.
4. **Children separately** — export concentrations/spots with parent-id filters rather than hoping a parent DTO embeds everything.
5. For **imports** of large geochem sets, use `/batch` (see `bulk-geochem-import` skill) — that is write-side, not download.

## Auth / feature notes

- Exports respect the same ACL as list endpoints — set `allowedAccess`.
- Some commercial features (bulk download) may additionally require a license feature. If you get 403 with a clear package otherwise visible, check `GET /api/management/litho-users/all-available-features`.

## Related

- Region filters: [geo-queries.md](geo-queries.md)
- Hierarchy & hydrate list: [domain-model.md](domain-model.md)
- Auth / ACL: [SKILL.md](SKILL.md)
