# Data models

What each analytical method actually records, and why the metadata around a number matters as much as the number itself.

These pages are **subject matter**, not workflow. They apply whether you are querying data ([`02_consuming-data/`](../02_consuming-data/)) or uploading it ([`03_contributing-data/`](../03_contributing-data/)). Read the page for your method before you map a lab export onto LithoSurfer fields, or before you interpret someone else's data.

| Related | Doc |
|---|---|
| The general sample → data point chain | [Data hierarchy](../01_using-the-api/data-hierarchy.md) |
| Who may read or write it | [Packages and access](../01_using-the-api/packages-and-access.md) |
| Resolving vocabulary names to IDs | [Reference lists](../01_using-the-api/reference-lists.md) |
| Exact DTO fields for your server | Swagger UI |

---

## The shared shape

Every method follows the same three-level pattern:

```
Sample                          ← the physical material
  └── Data point                ← one analytical session on that material
        └── Method specialization    ← GCDataPoint, FTDataPoint, UPbDataPoint, …
              └── Child measurements ← concentrations, spots, lengths, …
```

A data point carries exactly one method specialization. Which one it is shows up as the data point's `dataStructure` — `GC`, `UPB`, `FT`, `HE`, `TH`, `ARARDATAPOINT` and so on — so you can tell what a record is without joining anything.

Two consequences worth internalising:

1. **Measurements belong to the analysis, not to the sample.** A sample analysed twice has two data points, each with its own measurements. Averaging across them is your decision, not something the model does for you.
2. **The specialization holds the "how".** Instrument, preparation, calibration, precision — the context that decides whether two numbers are comparable. It is the part most often lost when data is exported to a spreadsheet, and the part these pages spend most of their time on.

---

## Methods

| Method | API area | Specialization | Child measurements | Page |
|---|---|---|---|---|
| **Geochemistry** | `/api/geochem/` | `GCDataPoint` | `ElementalConcentration`, `OxideConcentration`, `GCAliquot` | [geochemistry](geochemistry/) |
| **U-Pb** | `/api/upb/` | `UPbDataPoint` | `UPbSpotData`, `UPbAgeGroup` | Planned |
| **Fission track** | `/api/fissiontrack/` | `FTDataPoint` | `ft-count-data`, `ft-length-data`, `FTBinnedLengthData`, `FTSingleGrain`, `FTGrainProp` | Planned |
| **(U-Th)/He** | `/api/helium/` | `HeDataPoint` | `HeInSitu`, `HeWholeGrain` | Planned |
| **Ar-Ar** | `/api/arar/` | `ArArDataPoint` | `ArArMeasurement`, `ArArAliquot`, `ArArAgeCalc`, `ArArAgeSummary` | Planned |
| **Thermal history** | `/api/th/` | `THDataPoint` | `THModelConstraint`, `THPredResult`, `THistNickpoint` | Planned |
| **Lu-Hf** | `/api/luhf/` | — | — | Planned; entity names not exposed in the Lu-Hf Swagger group, confirm before use |

Other data structures exist that are not analytical methods — `SAMPLE_SET`, `BOREHOLE`, `GEO_PROJECT`, `GEO_SITE`, `FILE`, `DEPOSITINFO`. They share the data point mechanism but are outside the scope of these pages.

---

## Controlled vocabularies

Method metadata is mostly drawn from lookup lists, and **the list itself carries the definitions**. Every `L…` list returns the same four fields:

| Field | Meaning |
|---|---|
| `id` | The numeric foreign key you write |
| `name` | The label shown in the UI |
| `description` | What the term means — the authoritative definition |
| `sortorder` | Display order, usually least-to-most specific |

So when a page here describes a category, the same text is available live from the API. If a description and one of these pages ever disagree, the API wins. Fetching the list is also how you get IDs — never hardcode them, they differ per deployment ([reference lists](../01_using-the-api/reference-lists.md)).

---

## Writing a new method page

Keep the order consistent so readers can move between methods:

1. What the method measures, and what one data point represents.
2. The entity chain, with a diagram.
3. Metadata that decides comparability, with its vocabularies.
4. What must be preserved verbatim from the source.
5. The child measurements and their fields.
6. Common mistakes.

Use [geochemistry](geochemistry/) as the model.
