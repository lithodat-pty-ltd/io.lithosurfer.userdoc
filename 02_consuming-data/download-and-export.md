# Download and export

Pulling larger result sets without paging through UI-sized lists — raw rows, CSV/JSON export, and the platform's row limits.

| Related | Doc |
|---|---|
| Filtering by parent/child id, hydration | [Navigating and hydrating](navigating-and-hydrating.md) |
| Region filters | [Geographic queries](geographic-queries.md) |
| Access scoping | [Packages and access](../01_using-the-api/packages-and-access.md) |

---

## Endpoint roles

| Endpoint | Returns | Use when |
|---|---|---|
| `POST …/post?page=&size=` | Typed DTOs, paginated | Browse / small pages (default `size` is often 20) |
| `POST …/count/post` | A count | Check size before downloading |
| `POST …/findIds/post` | An id list | Cheap id set for hydration or follow-up filters |
| `GET\|POST …/raw[/post]` | Flat rows, still paginated | "Spreadsheet" rows without the full nested DTO |
| `POST …/download/post` | All matching raw rows, as JSON or CSV | One-shot export of a selection |
| `GET\|POST …/downloadShapefile[/post]` | A shapefile ZIP | GIS export of a selection |
| `GET /api/core/hydrate-*-by-id` | Nested DTOs | Expand known ids |

Not every entity exposes every variant — check Swagger for the resource you need.

## Hard limit: 50,000 rows

`POST …/download/post` is capped at **50,000 rows**. The server counts the criteria first; if the total exceeds the limit you get **HTTP 413** with a message to narrow the selection. Some UIs disable export earlier, but the API enforces 50,000 regardless of client.

**Strategy above 50,000 rows:** split the request — by data package, by geographic tile (see [Geographic queries](geographic-queries.md)), by `id` ranges, or by method/child table — and download each chunk separately.

Always run `count/post` before a download.

## Recipe: download samples in a region (JSON)

**Endpoint:** `POST /api/core/sample-with-locations/count/post`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5, "leftBound": 144.0,
  "upperBound": -37.5, "rightBound": 145.5
}
```

If the count is at or below 50,000:

**Endpoint:** `POST /api/core/sample-with-locations/download/post?format=json`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5, "leftBound": 144.0,
  "upperBound": -37.5, "rightBound": 145.5
}
```

For CSV, POST the same body to `/download/csv` on that resource — the response body is text, not JSON. Excel is `/download/excel` and returns an xlsx workbook. Shapefile is `/download/shapefile` and returns a zip (`.shp/.shx/.dbf/.prj`, WGS84 points) with map attributes rather than the CSV columns. GeoJSON is `/download/geojson` and returns a `FeatureCollection` (`.geojson`, WGS84 points) with the same map attributes as the shapefile.

An optional `blacklist` query parameter takes a list of column names to omit from the raw rows.

## Recipe: download method data points, then their measurements

```
Region / package criteria
  → count <Method>DataPoint
  → download/post <Method>DataPoint      (or findIds + hydrate-*-by-id)
  → download/post the child measurement type, filtered by the parent id
```

Example — geochemistry data points in a package:

**Endpoint:** `POST /api/geochem/GCDataPoint/count/post`

```json
{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }
```

**Endpoint:** `POST /api/geochem/GCDataPoint/download/post?format=json`

```json
{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }
```

Example — elemental concentrations for known GC data-point ids (chunk if there are many):

**Endpoint:** `POST /api/geochem/ElementalConcentration/download/csv`

```json
{ "gcdataPointId": { "in": [99001, 99002, 99003] } }
```

The same pattern applies to fission-track lengths, U-Pb spots, and other child measurement tables — find the child resource's `download/post` operation in Swagger.

## Recipe: ids → hydrated objects

When you need nested structure rather than flat export rows:

**Endpoint:** `POST /api/core/sample-with-locations/findIds/post`

```json
{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }
```

**Endpoint:** `GET /api/core/hydrate-samples-by-id?sampleIds=1,2,3`

For method payloads, use the matching `hydrate-*-by-id` endpoint (`hydrate-gc-by-id`, `hydrate-fissionTrack-by-id`, `hydrate-upb-by-id`, …) — see [Navigating and hydrating](navigating-and-hydrating.md).

## Raw vs download

- **`/raw[/post]` + `page`/`size`** — stream results in pages; good when you want progress feedback or to bound memory use yourself.
- **`/download/post`** — the server loads all matching rows in one response (still capped at 50,000). Prefer this for "give me the file" tasks under the limit.

Both return flat rows with joined aliases (sample name, data-point name, analyte, …), not the full nested create-DTO graph.

## Shapefile

**Endpoint:** `POST /api/core/sample-with-locations/downloadShapefile/post`

```json
{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }
```

Returns a ZIP (`application/octet-stream`). Also available on several method data-point resources — confirm in Swagger.

## Scaling playbook (above 50,000 rows, or deep nested trees)

1. **Count** at each level (samples, data points, children).
2. **Partition** the criteria: `dataPackageId`, a geographic tile, `id.greaterThan`/`id.lessThan` ranges, or `id.in` chunks of a few thousand.
3. **Prefer `findIds` → chunked download/hydrate** over one giant nested walk.
4. **Export children separately** — pull concentrations/spots with a parent-id filter rather than expecting a parent DTO to embed everything.
5. Large **imports** go through `…/batch` on the write side — see [Batch upload via API](../03_contributing-data/batch-upload-via-api/). That is a separate, write-side concern from everything on this page.

## Access and licensing

- Exports respect the same access rules as list endpoints — set `allowedAccess` (see [Packages and access](../01_using-the-api/packages-and-access.md)).
- Some commercial features (e.g. bulk download on certain package types) may additionally require a license feature. A `403` on a package that otherwise looks visible is worth checking against `GET /api/management/litho-users/all-available-features`.

## Related

- Region filters: [Geographic queries](geographic-queries.md)
- Filtering and hydration: [Navigating and hydrating](navigating-and-hydrating.md)
