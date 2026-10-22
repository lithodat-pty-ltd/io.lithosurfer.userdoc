# Reference lists (name → id)

Your source data uses labels (`Zr`, `Near-total`, `Aqua Regia`). The API stores **numeric foreign keys**. Fetch lookup lists once per import/script run and build maps.

## Pattern

1. `GET` (or search) the list endpoint from Swagger.  
2. Build `{ name or symbol → id }` in memory.  
3. Put the id on the DTO field (`lElementId`, `digestionCategoryId`, …).

Use the **core** list paths, under `/api/core/l-…` (for example `l-sample-kinds`, `l-sample-methods`, `l-location-kinds`, `l-countries`, `l-celestials`). The same names at the top level, `/api/l-…`, are admin-only and will refuse a normal account. Confirm the exact path in Swagger — casing is part of the path (`LElement` and `l-sample-kinds` are both real).

Many DTOs expose a pair: `…Id` for writing and `…Name` for reading back.

## Common lists

Confirm exact paths in Swagger.

| Concept | Typical use | Example path idea |
|---|---|---|
| Elements | Elemental concentrations | `/api/geochem/LElement` |
| Oxides | Oxide concentrations | `/api/geochem/LOxide` |
| Digestion category / method | GC data point | `/api/geochem/LDigestionCategory`, `…/LDigestionMethod` |
| Quantitation level | GC data point | `/api/geochem/LQuantitationLevel` |
| Relative operator (`<`, `>`) | Concentrations | relative-operator list |
| Sample kind / sampling method | Sample | core list endpoints |
| Origin | Sample — prefer materialised **path** (e.g. `/Depositional/Glacial`), kind `ORIGIN` | origin / vocabs endpoints |
| Data package | All writes | management data-packages |

Sample DTOs can carry many optional `*Id` fields (material, archive, stratigraphic unit, …). Same rule: if you have a name, resolve it via the matching list.

## What stays free text

Not everything is a controlled list. Survey/lab method codes, lab descriptions, and similar provenance fields are often plain strings on the data point. See domain guides (e.g. geochemistry) for which fields are verbatim vs lookup.
