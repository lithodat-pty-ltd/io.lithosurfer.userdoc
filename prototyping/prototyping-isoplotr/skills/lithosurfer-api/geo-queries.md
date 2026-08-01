# Geographic queries (GeoSquare, GeoJSON, clusters)

Two different “geo square” concepts — do not mix them up:

| Concept | Direction | Purpose |
|---|---|---|
| **Bounds on criteria** (`lowerBound` / `leftBound` / `upperBound` / `rightBound`) | **Filter in** | Restrict a search/list/download to a map rectangle |
| **`findGeoSquare`** | **Bounds out** | Compute the bounding box that fits matching records (map “fit to data”) |

## Bounds vocabulary

All four fields are degrees WGS84:

| Field | Meaning | Full-world default |
|---|---|---|
| `lowerBound` | south / min latitude | `-90` |
| `upperBound` | north / max latitude | `90` |
| `leftBound` | west / min longitude | `-180` |
| `rightBound` | east / max longitude | `180` |

Inclusive-ish filters: lat `> lowerBound` and `<= upperBound`; lon `> leftBound` and `<= rightBound` (sample path via `LocationCriteria`). Datapoint paths often use mirrored lat/lon on `data_point`.

Criteria classes that implement `GeoSquareFilter` accept these four fields on the JSON body of `/post` endpoints (and as query params on GET).

## Recipe: find samples in a region

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/post?page=0&size=100&sort=id,asc" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5,
    "leftBound": 144.0,
    "upperBound": -37.5,
    "rightBound": 145.5
  }'
```

Count first for large areas:

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/count/post" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5,
    "leftBound": 144.0,
    "upperBound": -37.5,
    "rightBound": 145.5
  }'
```

Ids only (lighter):

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/findIds/post" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5,
    "leftBound": 144.0,
    "upperBound": -37.5,
    "rightBound": 145.5
  }'
```

## Recipe: find method data points in a region

Same four bounds on the method criteria. Example — geochem:

```bash
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/GCDataPoint/post?page=0&size=100" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "lowerBound": -38.5,
    "leftBound": 144.0,
    "upperBound": -37.5,
    "rightBound": 145.5
  }'
```

Works the same for `FTDataPoint`, `UPbDataPoint`, `HeDataPoint`, `ArArDataPoint`, `LuHfDataPoint`, `PbIsotopeDataPoint`, `SrIsotopeDataPoint`, `IsoDataPoint`, `DepositInfo`, etc. Confirm with:

```bash
node .cursor/skills/lithosurfer-api/scripts/search-swagger.js "findGeoSquare" --what paths
```

## Recipe: fit map to a selection (`findGeoSquare`)

Returns `{ lowerBound, leftBound, upperBound, rightBound }` for the matching set — **does not return the features**.

```bash
# Estimated (default): fast, samples up to 5000 ids — may miss geographic outliers
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/core/sample-with-locations/findGeoSquare/post?mode=estimated" \
  --body '{
    "allowedAccess": "VIEWABLE",
    "dataPackageId": { "equals": 123 }
  }'

# Exact: full MIN/MAX — slower on huge ACL-filtered sets
node .cursor/skills/lithosurfer-api/scripts/call-api.js \
  POST "/api/geochem/GCDataPoint/findGeoSquare/post?mode=exact" \
  --body '{ "allowedAccess": "VIEWABLE", "dataPackageId": { "equals": 123 } }'
```

`mode` values: `estimated` (default; alias `sampled`), `exact`.

Resources that expose `findGeoSquare` (non-exhaustive): samples, borehole, GC / FT / UPb / He / ArAr / LuHf / Pb / Sr / Iso datapoints, deposits.

## GeoJSON (map features)

Two families:

1. **Per-entity GeoJSON on the method/core resource** — e.g. `GET|POST /api/geochem/geojson[/post]`, `/api/core/sample_geojson`, often with the same criteria + bounds.
2. **Swagger group 05 Geo Json** under **`/lithoapi/*_geojson`** — feature collections by data type for the portal map.

Empty selections should return a valid empty FeatureCollection, not 500.

Example (bounds as query params, client style):

```
GET /api/core/sample_geojson?lowerBound=-38.5&leftBound=144&upperBound=-37.5&rightBound=145.5&allowedAccess=VIEWABLE
```

Prefer `/post` with a JSON body when criteria get complex.

## Clusters

Several resources expose `/cluster` and `/cluster/post` for map clustering (`maxZoomLevel`, `maxNoOfCluster`, `maxClusterSize`). Use for overview maps, not for downloading measurements.

## Typical agent workflow (region → data)

```
1. Count samples/datapoints in bounds (+ allowedAccess)
2. If count is manageable: /post list OR /findIds/post
3. Optional: findGeoSquare to describe the actual footprint
4. For bulk tables: /download/post (see download-and-export.md)
5. For rich nested DTOs from ids: /api/core/hydrate-*-by-id
```

## Gotchas

- **Bounds filter ≠ findGeoSquare.** Putting bounds on criteria filters; calling `findGeoSquare` computes bounds.
- **Always set `allowedAccess`.** Empty region results are often ACL, not empty geology.
- **Dateline.** Server may swap left/right when a computed box crosses ±180°.
- **Performance.** Prefer `estimated` for interactive fit; use `exact` when you need true extremes. Narrow with `dataPackageId` / method filters before geo when possible.
- **Confirm field wiring in Swagger** — nested criteria differ slightly per method (`dataPointLithoCriteria`, `locationCriteria`, …).
