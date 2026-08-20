# Preparing geochemistry data for upload

The practical steps for getting a geochemistry dataset ready to load — how to shape your export and what to check before you send anything.

**Read [Geochemistry](../../04_data-models/geochemistry/) first.** It explains what the fields mean, which vocabularies exist, and how to map a lab package onto them. This page assumes you have done that mapping and are ready to organise the data.

| Topic | Where |
|---|---|
| What the fields mean, digestion and quantitation vocabularies | [Geochemistry data model](../../04_data-models/geochemistry/) |
| Sentinels, oxide closure, unit conversion, spectrography fingerprint | [Quality checks](../../04_data-models/geochemistry/quality-checks.md) |
| Per-analyte warning/fatal limits (working draft) | [Concentration thresholds](../../04_data-models/geochemistry/thresholds.md) |
| Sample → data point → concentrations | [Data hierarchy](../../01_using-the-api/data-hierarchy.md) |
| Writable packages / access | [Packages and access](../../01_using-the-api/packages-and-access.md) |
| General batch rules | [Batch upload via API](../batch-upload-via-api/) |
| Geochem batch pipeline with payloads | [Upload via API](upload-via-api/README.md) |

---

## Organise your export

Shape the data so each level of the model is unambiguous:

1. **One row per sample** — or a separate sample table — carrying location and sample metadata.
2. **One row per analysis**, linked to its sample, carrying method, digestion, quantitation and the source codes.
3. **One row per analyte**, linked to its analysis. Wide element columns are fine if your loader pivots them.

The linking columns matter more than the layout. Whatever identifies "which analysis does this value belong to" has to survive into the upload, because that is what becomes the parent-child relationship in LithoSurfer.

If the same sample was analysed twice, those are two analyses. Keep them separate all the way through — merging them is not recoverable afterwards.

---

## Before you upload

- [ ] Target **data package** is writable for you ([packages and access](../../01_using-the-api/packages-and-access.md)).
- [ ] Every analysis carrying chemistry has a digestion category — **Unknown** rather than blank.
- [ ] Four-acid and other HF methods are recorded as **Near-total**, not Total.
- [ ] Fire assay Au and PGE sit under **Fire assay**, not mixed into fusion totals for other elements.
- [ ] Semi-quantitative historic data is tagged as such.
- [ ] Source method codes, lab codes and units are retained, not discarded after mapping.
- [ ] Below-detection values keep their `<` and detection limit where the source published them.
- [ ] Element and oxide values are separated, in the units the laboratory reported.
- [ ] Duplicate analyses of one sample remain distinct analyses.
- [ ] Sentinels, oxide totals, unit conversion and historic spectrography have been checked ([quality checks](../../04_data-models/geochemistry/quality-checks.md)).

Every item above is a mistake that is expensive to correct after loading. The reasoning behind each one is in the [data model page](../../04_data-models/geochemistry/).

---

## What LithoSurfer will not do for you

- It will not convert aqua regia to a "total equivalent".
- It will not guess digestion from the element list alone.
- It will not treat all "Ti ppm" columns as one layer when digestion differs.
- It will not silently fix mixed units — keep an audit of the published unit.

---

## Upload paths

| Path | When to use | Doc |
|---|---|---|
| **Excel / table wizard** in the UI | Moderate volumes; interactive mapping | Ask Lithodat for the current geochem template |
| **Batch REST API** | Large volumes (thousands+); repeatable loads | [upload-via-api](upload-via-api/README.md) |

Both paths need the same preparation. The API only changes *how* records are sent.

---

## Getting help

| Question | Who |
|---|---|
| Data package / access | Your institution admin or Lithodat |
| Mapping a lab package to the digestion lists | Lithodat (geochem / data team) |
| API errors during a bulk load | Lithodat — with package ID, counts, and the error text |

Related: [Create data packages](../create-datapackages/) (when available) · [Using the API](../../01_using-the-api/)
