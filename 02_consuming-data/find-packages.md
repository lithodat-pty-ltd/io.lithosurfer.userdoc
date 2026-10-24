# Find data packages

How the package catalogue finds packages: one search, then the total from the response, then the content counts for the packages on the page.

Counting what is inside those packages is [Count data points in packages](count-package-contents.md).

## Service

`GET /api/management/data-packages` or `POST /api/management/data-packages/post`, with the same criteria. The list is paged (`page`, `size`) and sorted. The catalogue sorts by `distributionLastEditedTimestamp,desc`.

The response header **`X-Total-Count`** is the number of packages that match. That is the count on the catalogue itself. It is not a count of data points.

Hydration stays off (`hydrateDTO` defaults to false). The list does not need each package's nested records.

## Filters the catalogue sends

| Question | Criteria |
|---|---|
| Text in the search box | `searchTerm` — matches the package name, description, owning institution name, project id, project description, and whole words in keywords |
| Kind of data, such as thermal history | `hasDataStructure` — a `DataStructure` code. The package matches when it has at least one data point of that method that is not deleted. Codes are listed in [Count data points in packages](count-package-contents.md) |
| Owning institution | `institutionId.in` |
| A person on the team | `teamMemberId` — packages where that person is an editor or a supervisor |
| Packages whose team includes the caller | `actorIsInTeam=true` |
| Distribution | `distribution.equals` — `PUBLIC`, `PRIVATE`, `HIDDEN`, `COMMUNITY`, `COMMERCIAL` |
| Workflow | `workflowState.equals` — `IN_PROGRESS`, `FINISHED`, `FROZEN` |
| Celestial body | `celestialId`. The Earth catalogue looks up the celestial whose name contains `earth` and passes that id |
| GCMD keyword, ANZSRC field of research | `vocabIdGCMD.in`, `vocabIdFOR.in` |
| Provenance | `provenanceType.equals` — `CANONICAL`, `REPLICATED`, `COMPILATION` |
| Packages with samples in a country | `sampleLithoCriteria.locationCriteria.countryId.equals` |
| Packages with data in a region | `hasDataInRegion` — see [Geographic queries](geographic-queries.md) |

On GET these are query parameters (`hasDataStructure=TH`, `distribution.equals=PUBLIC`). On `POST …/post` they are fields of `DataPackageLithoCriteria`.

A curator counting packages that are waiting for review uses `GET /api/management/data-packages/count` with `curationState.equals=WAITING_FOR_CURATION` and `institutionId.in` set to the institutions they curate. That count is packages, not data points.

## Do not

Do not load every data point and group it by package to see which packages contain a method. `hasDataStructure` already answers that. Do not hydrate the list in order to count its contents; count with [Count data points in packages](count-package-contents.md).
