# Geochemistry (GC)

What a geochemistry record in LithoSurfer / EarthBank represents, and which metadata decides whether two numbers can be compared.

| Related | Doc |
|---|---|
| The pattern all methods share | [Understanding the data models](../) |
| Sample → data point → measurements | [Data hierarchy](../../01_using-the-api/data-hierarchy.md) |
| Preparing a lab export for upload | [Upload geochemistry data](../../03_writing-data/upload-geochemistry-data/) |
| The batch upload pipeline | [Upload via API](../../03_writing-data/upload-geochemistry-data/upload-via-api/) |
| Resolving vocabulary names to IDs | [Reference lists](../../01_using-the-api/reference-lists.md) |

Field names below come from the live Swagger spec. Confirm them against Swagger for your own server before writing — they change between versions.

---

## What one record represents

A concentration such as "Ti = 45 ppm" is only meaningful alongside **how the sample was opened**, **how it was measured**, and **how quantitative the result is**.

Aqua-regia Ti and fusion Ti are not the same measurand, even when both arrive in a spreadsheet column labelled `Ti_ppm`. Historic semi-quantitative spectrography is not a modern ICP-MS number. Without that context LithoSurfer cannot safely place two lab packages on the same map or colour ramp — so the model insists on capturing it.

**The rule that follows from this:** report what the laboratory published. Map it onto LithoSurfer's vocabularies. Do not convert partial digests into totals, and do not invent detection limits.

---

## Entity chain

```
Sample                                  ← the physical material
  └── GCDataPoint                       ← one analytical session: preparation, instrument, provenance
        ├── GCAliquot                   ← optional: a sub-sample or spot within the session
        ├── ElementalConcentration      ← e.g. Zr, 120 ppm
        └── OxideConcentration          ← e.g. SiO₂, 62.4 wt%
```

| Level | Represents | Typical source columns |
|---|---|---|
| **Sample** | Rock, sediment, soil, pulp, … | Sample ID, lat/lon, sample kind, origin |
| **GCDataPoint** | One method package or instrument run | Method code, digestion, technique, lab, date |
| **GCAliquot** | A spot or sub-sample within that run | Spot ID, grain domain, oxide total |
| **Concentration** | One analyte value | Element or oxide, value, `<`/`>`, detection limit |

The same sample analysed twice — a duplicate, a re-assay, a different method package — becomes **two** `GCDataPoint` records, each with its own concentrations. Never merge them into one.

**Elements and oxides are separate entities.** Fe reported as `Fe` ppm is an `ElementalConcentration`; Fe reported as `Fe₂O₃` wt% is an `OxideConcentration`. Store what the lab published rather than converting.

---

## Metadata that decides comparability

Every vocabulary below carries its own definitions in the `description` field of the list endpoint. The values shown are those on the production server; fetch the list for authoritative text and for IDs.

### Digestion category

How completely the sample was dissolved — the primary partition users filter on.

`GET /api/geochem/LDigestionCategory`

| Value | Meaning |
|---|---|
| **Total** | Sample fully dissolved or measured as a solid. Fusion, solid-state XRF, LECO, LOI |
| **Near-total** | Multi-acid with HF. Dissolves silicates but leaves zircon, chromite and rutile, so Zr, Cr, Ti, Hf, Sn and the REE may be under-reported |
| **Partial** | Aqua regia, single acid, three-acid without HF, weak leach. Silicates largely undissolved |
| **Selective / Sequential** | MMI, TerraLeach, sequential extraction. Measures a targeted phase, not bulk composition |
| **Fire assay** | Noble metal collection. Total for Au, Pt and Pd only; not meaningful for other elements |
| **None (in-situ)** | LA-ICP-MS, EPMA, portable XRF. No decomposition step |
| **Unknown** | Decomposition not recorded by the source |

**The mapping rule that catches everyone:** if HF was used and there was no fusion, the result is **Near-total**, even when the laboratory brochure calls it "total". Four-acid digests are near-total.

Prefer **Unknown** over leaving the field blank. "We don't know" is information; an empty field is not.

### Digestion method

The chemical mechanism — Aqua Regia, Four-Acid Digest, Lithium Borate Fusion, Fire Assay. Optional refinement of the category above.

`GET /api/geochem/LDigestionMethod`

Lab-specific package names, microwave steps and reagent strengths go in `digestionNotes` as free text, not into this list.

### Quantitation level

How quantitative the number is — independent of digestion.

`GET /api/geochem/LQuantitationLevel`

| Value | Meaning |
|---|---|
| **Quantitative** | Reported as a measured value with stated precision |
| **Semi-quantitative** | Order-of-magnitude only. Historic arc emission spectrography and similar; values fall on a preferred series |
| **Qualitative** | Presence, absence or "trace" only. No number |
| **Unknown** | Not recorded by the source |

Do not promote a result the lab called semi-quantitative.

### Analysis scale

What was analysed, spatially.

`GET /api/geochem/LGCAnalysisScale` — Whole Rock, Multi-Grain Aliquot, Single Grain, Spot, Unknown.

Scale drives whether aliquots are needed: whole-rock runs usually have none, spot analyses usually have one per spot.

### Analyte material

The physical form presented to the instrument.

`GET /api/geochem/LAnalyteMaterial` — Rock Fragment, Thin Section, Grain Mount, Fused Glass, Pressed Bead, Crushed Powder, Solution, Groundmass, Glass, Micro-drilled, Residue, Leachate, Unknown, Other.

This is not the same as digestion. A fused glass bead was prepared by fusion (digestion **Total**) and then measured as a solid; a solution was digested and then aspirated.

### Grain domain

For in-situ work, where on the grain the measurement sits — Core, Rim, Mantle, Mottled, Whole grain, Unknown, Other.

`GET /api/geochem/LGrainDomain`. Set on the **aliquot**, not the data point.

### Analytical technique

`GET /api/geochem/LGCAnalyticalTechnique` lists 35 techniques — ICPMS, XRF, ICP-OES, LA-ICP-MS, EPMA, TIMS, INAA and so on.

Two cautions:

- Several entries are prefixed **`[archived - don't use]`**. Filter them out when you build a name→id map, or you will silently attach new data to a retired term.
- `GCDataPointDTO` has **no** analytical-technique field. The vocabulary exists, but confirm in Swagger where it attaches for your server before assuming you can set it on the data point.

---

## Preserve the source wording

Controlled lists describe chemistry. Source codes stay free text, because every survey invents its own.

| Field | Why it matters |
|---|---|
| `sourceMethodCode` | The exact published code, e.g. `ME-ICP61`, `FA50` |
| `sourceMethodDesc` | The lab text that justified your mapping |
| `laboratoryCode` | The same code means different things at different labs |
| `sourceUnit` | As published — the audit trail for ppm ↔ wt% |
| `sourceAnalysisId` | Lets you rejoin the original export later |
| `sampleWeightGm` | Decisive for fire assay: FA25 and FA50 are not the same |
| `analysisDate` | Establishes the era and instrument cohort |
| `digestionNotes` | Package variants, reagent strengths, anything the lists cannot hold |

If someone later disputes a mapping, these fields are what settle it. Dropping them after mapping is the most common irreversible mistake in a geochem import.

---

## Concentrations

### ElementalConcentration

| Field | Notes |
|---|---|
| `gcdataPointId` | Parent analysis. Note the spelling — no underscore between `gc` and `data` |
| `elementId` | From `GET /api/geochem/LElement` |
| `concentration` | The reported value. The field is **`concentration`**, not `value` |
| `detectionLimit` | Same unit as the value; only when the source publishes it |
| `relativeOperatorId` | `<` or `>` from `GET /api/geochem/LRelativeOperator` |
| `error` | Reported uncertainty, interpreted via the data point's `elementErrorTypeId` |
| `isotopeId`, `measuredMass` | For isotope-resolved work |
| `aliquotName`, `spotID` | Ties the value to a `GCAliquot` |

### OxideConcentration

The same shape with `oxideId` from `GET /api/geochem/LOxide`, and errors interpreted via `oxideErrorTypeId`. Elemental and oxide values are written through separate endpoints.

### Below detection

Keep `<` and the detection limit as published. A bare `0` is a data-quality problem, not a below-detection value — do not convert one into the other, in either direction.

---

## Aliquots

`GCAliquot` groups measurements within a single analysis: `aliquotName`, `spotID`, `domainId` (grain domain), `analysisStart`, `oxideTotal`, `description`.

Whole-rock analyses generally need none. Reach for aliquots when one session produced several spatially distinct measurements — laser spots across a zoned grain, core versus rim — and you need to keep them apart. `oxideTotal` on the aliquot is where a major-element total belongs, rather than as a synthetic oxide row.

---

## Common mistakes

| Mistake | Consequence |
|---|---|
| Four-acid digest recorded as **Total** | Zr, Cr, Ti, Hf and REE silently under-reported against genuine totals |
| Digestion left blank instead of **Unknown** | Record is invisible to filters that require a category |
| Two analyses of one sample merged into one data point | Both provenance chains lost; no way to separate them later |
| Source method code discarded after mapping | Mapping can never be audited or corrected |
| Bare `0` treated as below-detection | Fabricated detection limits enter the database |
| Oxide values converted to elemental (or vice versa) | Published value no longer recoverable |
| Fire assay Au mixed in with fusion totals for other elements | Incomparable measurands share one layer |
| Archived technique terms used | New data attached to retired vocabulary |

---

## Field reference — `GCDataPointDTO`

Every `…Id` has a read-only `…Name` companion. Write the ID; read either.

| Group | Fields |
|---|---|
| **Preparation** | `digestionCategoryId`, `digestionMethodId`, `digestionNotes`, `digestionTempCelsius`, `sampleWeightGm`, `analyteMaterialId` |
| **Character of the result** | `quantitationLevelId`, `analysisScaleId`, `geochemAnalyticalTypeId`, `elementErrorTypeId`, `oxideErrorTypeId` |
| **In-situ / session** | `mineralId`, `referenceMaterialId`, `mountID`, `batchID`, `analyticalSessionID`, `laicpmsid`, `sampleType` |
| **Source provenance** | `sourceMethodCode`, `sourceMethodDesc`, `sourceAnalysisId`, `sourceUnit`, `laboratoryCode`, `analysisDate` |

Lookups verified in `/api/geochem/`: `LDigestionCategory`, `LDigestionMethod`, `LQuantitationLevel`, `LGCAnalysisScale`, `LAnalyteMaterial`, `LGrainDomain`, `LElement`, `LOxide`, `LIsotope`, `LRelativeOperator`, `LGCAnalyticalTechnique`, `LDataReductionSoftware`.

Error types resolve against `/api/core/l-error-types` and reference materials against `/api/core/reference-materials`. For `geochemAnalyticalTypeId` and `mineralId`, find the list in Swagger — they are not exposed in the geochem group.

---

## Next

- Preparing a spreadsheet for upload: [Upload geochemistry data](../../03_writing-data/upload-geochemistry-data/)
- The batch pipeline with payloads: [Upload via API](../../03_writing-data/upload-geochemistry-data/upload-via-api/)
