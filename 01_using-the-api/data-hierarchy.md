# Data hierarchy (subject matter)

How **geological / analytical records** relate to each other.  
This is about parent→child data, not about who may edit it.

Access control with packages is separate see [Packages and access](packages-and-access.md). 

---

## Subject-matter chain

```
Sample (+ Location)                 ← physical specimen; lat/lon when known
  └── Data point                    ← one analytical session / measurement event
        └── Method specialization
              (GCDataPoint, FTDataPoint, UPbDataPoint, HeDataPoint, …)
              └── Child measurements
                    (concentrations, spots, lengths, …)
```

| Link | Meaning |
|---|---|
| Sample → data point | This analysis was run on that specimen. One sample can have many data points (re-assays, other methods, duplicates). |
| Data point → method specialization | Exactly one method table per data point (e.g. geochem vs U-Pb). |
| Specialization → children | Measured values hang here, not directly on the sample. |

### Rules of thumb

1. **Sample is the geographic anchor.** Coordinates come from the sample’s location (maps may also use mirrored coords on data points).
2. **Measurements belong to the analysis**, not to the sample alone. Elemental concentrations belong to a `GCDataPoint`; fission-track lengths to an `FTDataPoint`; and so on.
3. **Create along the chain.** Sample id first, then data point, then child measurements.

---

## Package membership (orthogonal)

Both **sample** and **data point** carry a `dataPackageId`. Children are protected via their parent’s package.

```
                    ┌─ Sample ──────────────┐
 Data package  ───► │                       │
 (access only)      └─ Data point (+ kids) ─┘
```

- Same package on sample and its data points is the usual case when you import.
- Whether you may create or change those rows is entirely about that package being **writable** for you — not about the sample→data-point link.

Details: [Packages and access](packages-and-access.md).

---

## Typical entity → path map

Confirm paths in Swagger for your server version.

| Concern | Entity (API) | Typical path | Swagger area |
|---|---|---|---|
| Access container | data packages | `/api/management/data-packages` | Management |
| Specimen | `sample-with-locations` | `/api/core/sample-with-locations` | Core |
| Geochem analysis | `GCDataPoint` | `/api/geochem/GCDataPoint` | Geochem |
| Geochem children | `ElementalConcentration`, `OxideConcentration` | `/api/geochem/…` | Geochem |
| Other methods | `FTDataPoint`, `UPbDataPoint`, `HeDataPoint`, … | `/api/<method>/…` | Matching method group |

---

## Geochemistry example (subject chain only)

```
Sample
  └── GCDataPoint                 ← digestion, technique, source method code, …
        ├── ElementalConcentration   (e.g. Zr ppm)
        └── OxideConcentration       (e.g. SiO₂ wt%)
```

If the same sample was analysed twice, create **two** `GCDataPoint` rows, each with its own concentrations. Assign sample and data points to a writable package when you write them.

What these fields mean: [Geochemistry data model](../04_understanding-data-models/geochemistry/). Preparing an export: [`03_writing-data/upload-geochemistry-data/`](../03_writing-data/upload-geochemistry-data/).
