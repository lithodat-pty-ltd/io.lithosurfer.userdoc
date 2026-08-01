# Lithosurfer API — Group Reference

This is the full map of Swagger groups → URL path prefixes → contents. Use it when you need to pick the right group before searching the cached Swagger.

> Counts (paths / tags) come from prod swagger fetched on the date this file was written. They drift over time — treat as rough sizing, not authoritative.

## Group → URL prefix map

| Group | URL prefix(es) | ~paths | ~tags | Notes |
|---|---|---|---|---|
| **01 Account** | `/api/account`, `/api/authenticate`, `/api/register`, `/api/activate` | 8 | 2 | Authentication, registration, password reset, current user |
| **02 Management** | `/api/management/` | 78 | 20 | Communities, institutions, data packages, users, licenses, baskets, features |
| **03 Core Model** | `/api/core/` | 234 | 49 | Sample, person, literature, image, lab, machine, vocab, archive, lookup tables, IGSN, hydration helpers |
| **04 Other** | `/api/other/` | 55 | 15 | Jobs, snapshots, misc cross-cutting |
| **05 Geo Json** | `/lithoapi/*_geojson` | 48 | 1 | GeoJSON feature collections — one endpoint per data type (sample, age, AFT, AHe, ArAr, …) |
| **06 UPb** | `/api/upb/` | 47 | 11 | U-Pb data points, spot data, age groups + lookups |
| **07 Vitrinite Data** | `/api/vitrinite/` | 14 | 4 | Vitrinite reflectance |
| **08 Age Data** | `/api/age/` | 5 | 1 | Generic age-datapoint query/post |
| **09 Fission Track Data** | `/api/fissiontrack/` | 72 | 19 | FT data points, grains, lengths, binned lengths, count data + lookups |
| **10 Helium Data** | `/api/helium/` | 75 | 20 | (U-Th)/He — `HeDataPoint`, `HeInSitu`, `HeWholeGrain` + lookups |
| **11 Geochem Data** | `/api/geochem/` | 57 | 13 | Elemental + oxide concentrations, GC data points, aliquots, elements, isotopes |
| **12 ICPMS** | `/api/icpms/` | 66 | 22 | ICP-MS / HR-ICP-MS / ICP-MS/MS metadata + lookups |
| **13 SHRIMP Data** | `/api/shrimp/` | 21 | 7 | SHRIMP ages, spots, data points + SQUID importer |
| **14 Thermal History** | `/api/th/` | 64 | 19 | Thermal-history models, constraints, predictions |
| **15 Isotopes** | `/api/iso/` | 32 | 4 | Generic isotope data points, measurements, procedures |
| **16 ArAr** | `/api/arar/` | 91 | 23 | Ar-Ar — data points, measurements, aliquots, age calcs, irradiation, flux monitor |
| **17 Deposits** | `/api/deposit/` | 48 | 14 | Mineral deposits, deposit ages |
| **18 Lu-Hf** | `/api/luhf/` | 49 | 12 | Lu-Hf data, age groups, isochrons |
| **19 Pb-Isotope** | `/api/pbisotope/` | 61 | 16 | Pb-isotope data |
| **20 Sr-Isotope** | `/api/srisotope/` | 37 | 8 | Sr-isotope data |
| **99 Admin** | _all of the above_ | ~1900 | ~550 | Union of every endpoint. Use as catch-all when you can't guess the group |

## Finding the right group

### Decision flow

1. **Authentication or current user?** → 01 Account
2. **Communities, institutions, data packages, users, licenses?** → 02 Management
3. **Samples, persons, literature, images, vocab/lookups, IGSN?** → 03 Core Model
4. **Per-analytical-method data?** → 06–20 (see table) — pick by method.
5. **Map / GeoJSON output?** → 05 Geo Json (under `/lithoapi/`, not `/api/`)
6. **Background jobs / snapshots?** → 04 Other
7. **Don't know?** → search 99 Admin.

### Method → group quick-pick

| Analytical method | Group | Prefix |
|---|---|---|
| U-Pb | 06 UPb | `/api/upb/` |
| Vitrinite reflectance | 07 Vitrinite Data | `/api/vitrinite/` |
| Generic Age | 08 Age Data | `/api/age/` |
| Fission Track | 09 Fission Track Data | `/api/fissiontrack/` |
| (U-Th)/He | 10 Helium Data | `/api/helium/` |
| Whole-rock / mineral geochem | 11 Geochem Data | `/api/geochem/` |
| ICP-MS metadata | 12 ICPMS | `/api/icpms/` |
| SHRIMP | 13 SHRIMP Data | `/api/shrimp/` |
| Thermal History modelling | 14 Thermal History | `/api/th/` |
| Generic isotopes | 15 Isotopes | `/api/iso/` |
| Ar-Ar | 16 ArAr | `/api/arar/` |
| Mineral deposits | 17 Deposits | `/api/deposit/` |
| Lu-Hf | 18 Lu-Hf | `/api/luhf/` |
| Pb-isotope | 19 Pb-Isotope | `/api/pbisotope/` |
| Sr-isotope | 20 Sr-Isotope | `/api/srisotope/` |

## Tag naming conventions

Inside each group, operations are tagged. There are two coexisting styles:

- **PascalCase entity tag** (e.g. `Person`, `FTDataPoint`, `UPbAgeGroup`) — used for the main entity controllers exposing the standard CRUD/search surface.
- **kebab-case `-litho-resource` tag** (e.g. `sample-with-location-resource`, `community-litho-resource`) — used by JHipster-generated resources. Some entities have both.

When searching for an endpoint, treat tag and path as independent hints: the **path** is what you actually call, the **tag** just groups operations in Swagger UI.

## Access control (where to look)

All authorization endpoints live in **02 Management** (and a few in **01 Account**). The detailed model is in `SKILL.md` → "Authorization & access control"; quick locator:

| Concern | Endpoint(s) | Tables |
|---|---|---|
| System role / authority | `GET /api/account` | `jhi_user_authority`, `jhi_authority` |
| Who am I (domain) | `GET /api/management/litho-users/authenticated-litho-user` | `litho_user` |
| Package distribution / workflow | `GET /api/management/data-packages/{id}` | `data_package.distribution`, `.workflow_state` |
| Team membership (editor) | `/api/management/data-package-2-editors` | `data_package_2_editor` |
| Team membership (supervisor) | `/api/management/data-package-2-supervisors` | `data_package_2_supervisor` |
| Contacts / subscribers | `/api/management/DataPackage2User` | `data_package_2_user` (`jhi_role` ∈ `CONTACT`, `SUBSCRIBER`) |
| Institution curators | `/api/management/Institution2User` | `institution_2_user` (`jhi_role = CURATOR`) |
| Packages I can access | `GET /api/management/litho-users/accessibledataPackages?allowedAccess=...` | derived |
| Feature gates / licensing | `/api/management/LicenseAssignment`, `/api/management/UserLicense`, `/api/management/License2Feature`, `/api/management/Feature`, `/api/management/litho-users/all-available-features` | `license_assignment`, `user_license`, `license_2_feature`, `feature` |
| Data-license attached to package | `/api/management/data-license` | `data_license` |

**Use the `allowedAccess` query param** (`VIEWABLE` / `WRITEABLE` / `PREVIEWABLE` / `VIEWABLE_AND_PREVIEWABLE`) on every list endpoint that supports it — it's the cheapest way to scope a query to "what this JWT is actually allowed to see".

## Common cross-cutting operations

Search the Swagger cache for these path suffixes when executing agent tasks:

| Suffix | Meaning | Details |
|---|---|---|
| `/findGeoSquare[/post]` | Compute bounding box of a selection | [geo-queries.md](geo-queries.md) |
| Criteria fields `lowerBound`/`leftBound`/`upperBound`/`rightBound` | Filter *to* a region | [geo-queries.md](geo-queries.md) |
| `/download/post` | Export raw rows (JSON/CSV), max 50k | [download-and-export.md](download-and-export.md) |
| `/raw[/post]` | Paginated flat rows | [download-and-export.md](download-and-export.md) |
| `/findIds/post` | Id list only | [download-and-export.md](download-and-export.md) |
| `/hydrate-*-by-id` | Expand ids → nested DTOs | [domain-model.md](domain-model.md) |
| `/geojson[/post]`, `/lithoapi/*_geojson` | Map feature collections | [geo-queries.md](geo-queries.md) |

## Lookup tables

Anywhere you see `L<Name>` (e.g. `LUnit`, `LCountry`, `LElement`) or `l-<name>` (e.g. `l-sample-kinds`, `l-country`), that's a reference / lookup table. They behave like any other entity but are usually read-only for non-admin users.

Common lookups in Core Model:

| Path | Purpose |
|---|---|
| `/api/core/LUnit` | physical units |
| `/api/core/l-country` | countries |
| `/api/core/l-celestial` | celestial bodies (Earth, Moon, …) |
| `/api/core/l-sample-kinds` | sample kind taxonomy |
| `/api/core/l-sample-methods` | sample collection methods |
| `/api/core/l-analytical-method` | analytical methods |
| `/api/core/l-machine-type` | instrument types |

For per-method lookups, see the matching group (e.g. `/api/fissiontrack/LDosimeter`, `/api/upb/LUPbCommonPbCorrection`).
