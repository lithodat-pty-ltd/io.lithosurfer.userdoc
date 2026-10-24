# Count data points in packages

How many data points, of which analytical method, are in one or more data packages.

The package catalogue answers this with one count call for every package on the page. It does not load the data points.

To download the package as one ZIP, use [Download a data package](download-package.md). To pull selected rows, use [Download and export](../../02_consuming-data/download-and-export.md).

## Service

`POST /api/management/data-packages/content-counts/post`

## Request

```json
{
  "dataPackageIds": [101, 102],
  "kinds": ["TH", "FT"]
}
```

`dataPackageIds` is the packages to count. `kinds` is optional. Leave it out to count every method that has data. Pass a list to limit the count to those methods.

Method codes are the `DataStructure` values:

| Code | Method |
|---|---|
| `FT` | Fission track |
| `HE` | (U-Th)/He |
| `GC` | Geochemistry |
| `UPB` | U–Pb |
| `TH` | Thermal history |
| `ARARDATAPOINT` | Ar–Ar data |
| `ARARIRRADIATION` | Ar–Ar irradiation |
| `ARARSETUP` | Ar–Ar setup |
| `VITRINITE` | Vitrinite |
| `ISO` | Stable isotopes |
| `LUHF` | Lu–Hf |
| `PB_ISOTOPE` | Pb isotopes |
| `SR_ISOTOPE` | Sr isotopes |
| `DEPOSITINFO` | Deposit info |
| `FILE` | File data points |
| `GEO_PROJECT` | Geo project |
| `GEO_SITE` | Geo site |
| `BOREHOLE` | Borehole |

## Answer

A map of package id to method code to count:

```json
{
  "101": { "TH": 23, "FT": 4 },
  "102": { "HE": 12 }
}
```

Only packages you can see are included. Only methods with at least one data point are included. A missing method on a package that is present means zero. A missing package means you cannot see it, or it has no data points of the requested methods. Deleted data points are left out.

## Samples and files

This call does not count samples or files. The catalogue asks for those separately, once per package:

| Question | Service |
|---|---|
| How many samples are in this package? | `GET /api/core/sample-with-locations/count?dataPackageId.in=101` |
| How many files are attached to this package? | `GET /api/other/file-browser/dataPackage/101/count` |

## Do not

Do not download the data points, page through them, or call a count once per method. The content-counts call is the count. A generic `POST …/count/post` on a data-point resource is for sizing a download of those rows, not for the numbers on a package.
