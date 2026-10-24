# Search samples and data points

How to search samples and analytical data. Geochemistry, fission track, U–Pb, helium, Lu–Hf, Ar–Ar, thermal history, and the other methods take the same criteria. Change the path. Keep the body.

Finding a package is a different search: [Find data packages](../05_managing-packages/catalogue/find-packages.md).

## Service

`GET /api/<area>/<Entity>` or `POST /api/<area>/<Entity>/post`, with the same criteria. The list is paged (`page`, `size`) and sorted.

The response header **`X-Total-Count`** is the number of rows of that entity that match. It is not a count of samples unless you searched samples, and it is not a count of packages.

The same body is the count, the id list, and the row download:

| Call | Returns |
|---|---|
| `POST …/post` | One page of records |
| `POST …/count/post` | The number of matches |
| `POST …/findIds/post` | The matching ids |
| `POST …/download/post` | The matching rows, up to the export limit — see [Download and export](download-and-export.md) |

Deleted rows are left out. To go from a sample to its data points, or from a measurement to its parent, see [Navigating records](navigating.md).

## Where a filter goes

| Layer | What belongs there |
|---|---|
| The method criteria, beside `dataPointLithoCriteria` | Fields of that method only: mineral, batch, reference material, and the measurement's own columns |
| `dataPointLithoCriteria` | Fields shared by every data point: name, sample, package, tag, literature, lab, funding, person, instrument, a property, and `allowedAccess` |
| `dataPointLithoCriteria.sampleLithoCriteria` | A constraint on the sample that data point belongs to. Same fields as the sample search below |

`allowedAccess` on a method search sits inside `dataPointLithoCriteria`. Leave it out and the search is `VIEWABLE`. Values are `VIEWABLE`, `WRITEABLE`, `PREVIEWABLE`, and `VIEWABLE_AND_PREVIEWABLE`. See [Packages and access](../01_using-the-api/packages-and-access.md).

On GET the nested fields are dotted query parameters (`dataPointLithoCriteria.sampleId.equals=12345`). On `POST …/post` they are nested objects.

## One body, any method

**Endpoint:** `POST /api/geochem/GCDataPoint/post?page=0&size=20`

```json
{
  "mineralId": { "in": [55] },
  "batchID": { "contains": "RUN-12" },
  "dataPointLithoCriteria": {
    "allowedAccess": "VIEWABLE",
    "name": { "contains": "SITE" },
    "sampleId": { "equals": 12345 },
    "dataPackageId": { "in": [101, 102] },
    "tagId": { "in": [7] },
    "literatureId": { "in": [9] },
    "labId": { "in": [3] },
    "fundingId": { "in": [4] },
    "personId": { "in": [12] }
  }
}
```

The same JSON sent to another method resource searches that method. Copy the path from Swagger. These are the method lists:

| Method | Path |
|---|---|
| Geochemistry | `/api/geochem/GCDataPoint` |
| Fission track | `/api/fissiontrack/FTDataPoint` |
| U–Pb | `/api/upb/UPbDataPoint` |
| (U-Th)/He | `/api/helium/HeDataPoint` |
| Lu–Hf | `/api/luhf/LuHfDataPoint` |
| Ar–Ar | `/api/arar/ArArDataPoint` |
| Thermal history | `/api/th/THDataPoint` |
| Stable isotopes | `/api/iso/IsoDataPoint` |

## Filters every data-point list sends

| Question | Field on `dataPointLithoCriteria` |
|---|---|
| Name contains this text | `name.contains` |
| This sample | `sampleId.equals` |
| One of these packages | `dataPackageId.in` |
| Tagged with | `tagId.in` — the data point is linked to that tag |
| Cited by | `literatureId.in` — linked literature |
| Measured at | `labId.in` — linked lab |
| Funded by | `fundingId.in` — linked funding |
| Person | `personId.in` — linked person |
| Instrument | `machineId.in` — thermal history and vitrinite send this; the field is on the shared criteria |
| A property name and value | `datapointPropertyCriteria.propName.equals` and `datapointPropertyCriteria.propValue.equals` — the isotope and deposit lists send this |

Tag, literature, lab, funding, and person match a link on the data point. They are not columns of the method table.

## Filters that belong to the method

Geochemistry, fission track, U–Pb, and helium put these beside `dataPointLithoCriteria`. Another method has them only when its criteria in Swagger declares them.

| Question | Field |
|---|---|
| Mineral | `mineralId.in` |
| Reference material | `referenceMaterialId.equals` |
| Batch id contains this text | `batchID.contains` |

A mineral `in` search includes the chosen material and its descendants in the material tree. Asking for a parent mineral also returns analyses of the materials under it.

To limit a method search by the sample's rock, country, or other sample field, nest [the sample filters](#sample-search) under `dataPointLithoCriteria.sampleLithoCriteria`. A region uses the bounds on the method criteria — see [Geographic queries](geographic-queries.md).

## Measurements

A child list is the same search on the child resource. Keep the shared filters in `dataPointLithoCriteria`, and put the child's own column beside it.

Oxide concentrations, `POST /api/geochem/OxideConcentration/post`:

```json
{
  "oxideId": { "equals": 14 },
  "dataPointLithoCriteria": {
    "allowedAccess": "VIEWABLE",
    "dataPackageId": { "in": [101] }
  }
}
```

Elemental concentrations use `elementId.equals` on `/api/geochem/ElementalConcentration` and the same `dataPointLithoCriteria`. Other children (spots, lengths, aliquots) follow that shape. The parent id filter is in [Navigating records](navigating.md).

## Sample search

**Endpoint:** `POST /api/core/sample-with-locations/post`

`allowedAccess` sits on the sample criteria itself. The other fields are the sample list:

| Question | Field |
|---|---|
| Sample name contains this text | `name.contains` |
| One of these packages | `dataPackageId.in` |
| Material | `materialId.in` — includes that material and its descendants, as `mineralId` does on a method |
| Tag, literature, funding, person | `tagId.in`, `literatureId.in`, `fundingId.in`, `personId.in` — a link on the sample |
| IGSN box | `doi.contains`. The box labelled IGSN searches `doi`. `igsn` is a separate field |
| Samples that have an image | `withImagesOnly` true |
| A sample property | `samplePropertyCriteria.propName.equals` and `samplePropertyCriteria.propValue.equals` |
| Sampling method, archive | `sampleMethodId.in`, `archiveId.in` |
| Creator, last editor | `createdById.in`, `lastEditedById.in` |
| Country | `locationCriteria.countryId.equals` |

## Do not

Do not download a package, or page through a method, to keep the rows whose name, mineral, tag, literature, lab, funding, or person matches. Those filters are the search.

Do not count by walking pages. `X-Total-Count` on the list, or `POST …/count/post` with the same body, is the count. Counting data points per package, without listing them, is [Count data points in packages](../05_managing-packages/catalogue/count-package-contents.md).
