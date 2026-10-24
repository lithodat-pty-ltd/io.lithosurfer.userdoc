# Download a data package

The package catalogue's Download button fetches a ZIP snapshot of the whole package. It does not download the rows itself.

A snapshot is the package as it was when the ZIP was built: spreadsheets and shapefiles for each method that had data, plus the package's files. Building it runs in the background. The button downloads a finished ZIP, or starts a build and waits for the email.

To export a selection of rows (one method, one region, one sample), use [Download and export](../../02_consuming-data/download-and-export.md). To see how many data points the package holds before you download, use [Count data points in packages](count-package-contents.md).

## Look up the latest ZIP

`GET /api/other/Snapshot?datapackageId.equals=101&sort=createdTimestamp,desc`

The first row is the newest snapshot of that package. Useful fields:

| Field | Meaning |
|---|---|
| `id` | Pass this to the download call |
| `state` | `RUNNING`, `FINISHED`, or `FAILED`. `INIT` is a snapshot that was recorded and not started |
| `createdTimestamp` | When this ZIP was requested |
| `protocol` | The build log: which methods were written, and which were skipped |
| `datapackageName` | Package name at the time of the snapshot |

Download a row only when `state` is `FINISHED`.

The catalogue treats that ZIP as current when `createdTimestamp` is later than the package's `lastEditedTimestamp`. An older ZIP is still the file to download; a new build is a separate step.

The list returns snapshots of packages you can find. Starting a build and downloading a ZIP require that you can view the package.

## Download the ZIP

`GET /api/other/Snapshot/download/555`

`555` is the snapshot id. The body is the ZIP (`application/x-zip-compressed`). The file name is the one stored with the snapshot.

## Start a new ZIP

`GET /api/other/Snapshot/startExportProcess/101`

Send a `Referer` header. The call is rejected without one. The header value is the link in the notification email; any URL of the site is enough.

The call returns immediately with the new snapshot, `state` `RUNNING`. The ZIP is not in that response. When the build finishes or fails, the server emails the person who started it. The mail says the export is ready and includes the protocol. Read the snapshot again, and download it once `state` is `FINISHED`.

A package can have only one build in `RUNNING`. A second start is rejected: an export for this package is already running. Wait for that one.

You can view the package and still start a build. You do not have to be an editor or a supervisor.

## What the ZIP contains

One folder, named after the package, with a subfolder per method that had rows. Each of those holds an `.xlsx` workbook and, where listed, a shapefile (`.shp`, `.shx`, `.dbf`, `.prj`). A method with no rows is left out. A method over its row cap is left out, and the protocol says so.

| Folder | Workbook | Shapefile | Left out above |
|---|---|---|---|
| `Samples` | yes | yes | 50,000 |
| `Fission Track` | yes | yes | 50,000 |
| `Geochem` | yes | yes | 50,000 |
| `Helium` | yes | yes | 50,000 |
| `UPb` | yes | yes | 50,000 |
| `Iso` | yes | yes | 100,000 |
| `isotopes.au` | yes, same isotope data in the isotopes.au workbook | yes | 50,000 |
| `Thermal History` | yes | yes | 50,000 |
| `ArAr Data` | yes | yes | 50,000 |
| `ArAr SetUp` | yes | no | 50,000 |
| `ArAr Irradiation` | yes | no | 50,000 |
| `Files` | the files stored on the package | no | — |

On an isotopes.au request, the isotope folder also gets the isotopes.au licence PDF, and the package folder gets a readme PDF.

Vitrinite, Lu–Hf, deposit info, boreholes, and the other methods not in this table are not in the ZIP. Export those with [Download and export](../../02_consuming-data/download-and-export.md).

A finished ZIP can still be missing a method. Read `protocol` before treating the file as complete.

## History

The same list is the history. `GET /api/other/Snapshot?datapackageId.equals=101&sort=createdTimestamp,desc` returns every snapshot of the package, newest first. Each `FINISHED` row is a ZIP of the package at that time, downloaded by its own id.

## Do not

Do not assemble a package download by calling `download/post` on each method. That path is for a selection of rows, and it stops at 50,000 rows per call. The catalogue downloads one snapshot ZIP.

Do not page through the package's data points to build the file. If no `FINISHED` snapshot exists, or the newest one is older than the package's last edit, start a build and download that snapshot when it finishes.
