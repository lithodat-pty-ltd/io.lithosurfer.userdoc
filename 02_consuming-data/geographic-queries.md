# Geographic queries

Region filters, fitting a map to a selection, GeoJSON, and clustering.

| Related | Doc |
|---|---|
| Parent/child filters, hydration | [Navigating and hydrating](navigating-and-hydrating.md) |
| Bulk export of a region | [Download and export](download-and-export.md) |
| Access scoping | [Packages and access](../01_using-the-api/packages-and-access.md) |

Set `allowedAccess` on every call — an empty result for a region is almost always access, not empty geology.

---

## Two different "geo square" concepts — do not mix them up

| Concept | Direction | Purpose |
|---|---|---|
| **Bounds on criteria** (`lowerBound` / `leftBound` / `upperBound` / `rightBound`) | Filter **in** | Restrict a search/list/download to a map rectangle |
| **`findGeoSquare`** | Bounds **out** | Compute the bounding box that fits the matching records (map "fit to data") |

## Bounds vocabulary

All four fields are degrees WGS84:

| Field | Meaning | Full-world default |
|---|---|---|
| `lowerBound` | south / min latitude | `-90` |
| `upperBound` | north / max latitude | `90` |
| `leftBound` | west / min longitude | `-180` |
| `rightBound` | east / max longitude | `180` |

Filters are inclusive-ish: latitude `> lowerBound` and `<= upperBound`; longitude `> leftBound` and `<= rightBound` (sample path, via `LocationCriteria`). Data-point paths often carry mirrored lat/lon directly for map queries.

Any entity whose criteria implements `GeoSquareFilter` accepts these four fields on the JSON body of a `/post` endpoint (or as query params on a plain `GET`).

## Recipe: find samples in a region

**Endpoint:** `POST /api/core/sample-with-locations/post?page=0&size=100&sort=id,asc`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5,
  "leftBound": 144.0,
  "upperBound": -37.5,
  "rightBound": 145.5
}
```

Count first for a large area:

**Endpoint:** `POST /api/core/sample-with-locations/count/post`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5,
  "leftBound": 144.0,
  "upperBound": -37.5,
  "rightBound": 145.5
}
```

Ids only — lighter than a full list:

**Endpoint:** `POST /api/core/sample-with-locations/findIds/post`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5,
  "leftBound": 144.0,
  "upperBound": -37.5,
  "rightBound": 145.5
}
```

## Recipe: find method data points in a region

The same four bounds fields work on method criteria. Example — geochemistry:

**Endpoint:** `POST /api/geochem/GCDataPoint/post?page=0&size=100`

```json
{
  "allowedAccess": "VIEWABLE",
  "lowerBound": -38.5,
  "leftBound": 144.0,
  "upperBound": -37.5,
  "rightBound": 145.5
}
```

Works the same way for `FTDataPoint`, `UPbDataPoint`, `HeDataPoint`, `ArArDataPoint`, `LuHfDataPoint`, `PbIsotopeDataPoint`, `SrIsotopeDataPoint`, `IsoDataPoint`, `DepositInfo`, and other method groups that expose `findGeoSquare` — confirm which resources support it in Swagger for your server.

## Recipe: fit a map to a selection (`findGeoSquare`)

Returns `{ lowerBound, leftBound, upperBound, rightBound }` for the matching set — **not** the features themselves.

**Endpoint:** `POST /api/core/sample-with-locations/findGeoSquare/post?mode=estimated`

```json
{
  "allowedAccess": "VIEWABLE",
  "dataPackageId": { "equals": 123 }
}
```

- `mode=estimated` (default; alias `sampled`) — fast, samples up to 5,000 ids; may miss geographic outliers. Good for interactive "fit to data".
- `mode=exact` — full min/max; slower on large access-filtered sets, but gives the true extremes.

Also available on several method data-point resources (geochemistry, fission track, U-Pb, helium, Ar-Ar, Lu-Hf, Pb/Sr isotope, deposits — non-exhaustive; confirm in Swagger).

## GeoJSON (map features)

Two families:

1. **Per-entity GeoJSON on the method/core resource** — e.g. `GET|POST /api/geochem/geojson[/post]`, `GET /api/core/sample_geojson`, usually taking the same criteria and bounds fields as above.
2. **Swagger group `05 Geo Json`**, under `/lithoapi/*_geojson` — **not** `/api/` — feature collections by data type for map display (sample, age, AFT, AHe, ArAr, …).

Example:

```
GET /api/core/sample_geojson?lowerBound=-38.5&leftBound=144&upperBound=-37.5&rightBound=145.5&allowedAccess=VIEWABLE
```

Prefer the `/post` form with a JSON body once criteria get more complex than a handful of query params.

An empty selection should return a valid empty `FeatureCollection`, not an error — if you get a server error instead, that is worth reporting rather than working around.

## Clusters

Several resources expose `/cluster` and `/cluster/post` for map clustering (`maxZoomLevel`, `maxNoOfCluster`, `maxClusterSize`). Use for overview maps, not for retrieving individual measurements.

## Typical workflow: region → data

```
1. Count samples/data points in bounds (with allowedAccess)
2. If the count is manageable: list via /post, or ids via /findIds/post
3. Optional: findGeoSquare to describe the actual footprint of a selection
4. For bulk export: see Download and export
5. For rich nested detail from known ids: /api/core/hydrate-*-by-id
```

## Gotchas

- **Bounds filter ≠ `findGeoSquare`.** Putting bounds on criteria filters the results; calling `findGeoSquare` computes bounds from a selection.
- **Always set `allowedAccess`.** An empty region result is very often access, not empty geology.
- **Dateline.** A computed box crossing ±180° may come back with left/right swapped.
- **Performance.** Prefer `mode=estimated` for interactive map-fitting; use `exact` only when you need true extremes. Narrow with `dataPackageId` or method filters before adding a geo filter where possible.
- **Confirm nested field names in Swagger** — nested criteria differ slightly per method (`dataPointLithoCriteria`, `locationCriteria`, …).

## Related

- Filtering by parent/child id, hydration: [Navigating and hydrating](navigating-and-hydrating.md)
- Bulk export of a selection: [Download and export](download-and-export.md)
