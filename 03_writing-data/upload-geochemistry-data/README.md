# Preparing geochemistry data for upload

This guide is for geologists and data contributors preparing geochemistry datasets for LithoSurfer / EarthBank. It explains **what you need to understand** before you upload — not which button to click.

| Topic | Where |
|---|---|
| Sample → data point → concentrations | [Data hierarchy](../../01_using-the-api/data-hierarchy.md) |
| Writable packages / access | [Packages and access](../../01_using-the-api/packages-and-access.md) |
| General batch rules | [Batch upload via API](../batch-upload-via-api/) |
| Geochem batch pipeline | [upload via API](upload-via-api/README.md) |
| General API usage | [`01_using-the-api/`](../../01_using-the-api/) |

---

## Why preparation matters

A concentration such as “Ti = 45 ppm” is only meaningful if you also know **how the sample was opened**, **how it was measured**, and **how quantitative the result is**.

Without that context, LithoSurfer cannot safely put different lab packages on the same map or colour ramp. Aqua-regia Ti and fusion Ti are not the same measurand, even if both are labelled “Ti ppm” in a spreadsheet. Historic semi-quantitative spectrography is not the same as a modern ICP-MS number.

**Rule of thumb:** report what the laboratory published. Map it onto LithoSurfer’s short chemistry lists. Do **not** convert partial digests into “totals”, and do **not** invent detection limits.

---

## Geochemistry on the subject hierarchy

Geochem uses the standard analytical chain ([data hierarchy](../../01_using-the-api/data-hierarchy.md)). Put sample and analyses in a writable [data package](../../01_using-the-api/packages-and-access.md) when you upload — that is access control, not part of this tree:

```
Sample
  └── GCDataPoint (analysis)
        ├── Element concentrations
        └── Oxide concentrations
```

| Level | What it represents | Typical source columns |
|---|---|---|
| **Sample** | Rock, sediment, soil, pulp, … | Sample ID, lat/lon, sample kind, origin, sampling method |
| **GC data point** | One method package / instrument run | Method code, digestion, technique, lab, date |
| **Concentration** | One analyte value | Element/oxide, value, `<`/`>`, detection limit |

If the same sample was analysed twice (duplicate, re-assay, different package), create **two** GC data points, each with its own concentrations.

---

## What a complete geochem row needs

### 1. Sample identity and location

- A stable **sample name** from your source (kept for audit).
- **Coordinates** when the sample is spatial (lat/lon; datum if you have it).
- Optional but useful for filtering later:
  - **Sample kind** (e.g. rock, stream sediment, soil)
  - **Origin** (geological setting — LithoSurfer uses a hierarchical path such as `/Depositional/Glacial`)
  - **Sampling method**

### 2. Analytical metadata (on the GC data point)

This is what makes the chemistry **comparable**.

#### Digestion category (primary)

How completely the sample was dissolved (or that it was not dissolved). This is the main partition users will filter on the map.

| Category | Meaning (short) |
|---|---|
| **Total** | Fully dissolved or measured as a solid (fusion, solid-state XRF, LECO, LOI, …) |
| **Near-total** | Multi-acid **with HF** — silicates dissolve; zircon/chromite/rutile often remain |
| **Partial** | Aqua regia, single/three-acid without HF, weak leaches |
| **Selective / Sequential** | Targeted phase (MMI, TerraLeach, sequential schemes) |
| **Fire assay** | Noble-metal collection — total for Au/Pt/Pd only |
| **None (in-situ)** | No decomposition (LA-ICP-MS, EPMA, pXRF) |
| **Unknown** | Source did not record decomposition |

**Important mapping rule:** if HF was used and there was **no fusion**, map to **Near-total** — even when the laboratory brochure says “total”. Four-acid digests are near-total, not total.

#### Digestion method (optional refine)

The chemical mechanism (Aqua Regia, Four-Acid Digest, Lithium Borate Fusion, Fire Assay, …). Use the controlled list when you can; put lab-specific package names and quirks in **digestion notes**.

#### Analytical technique

The finish / instrument family (ICP-MS, ICP-OES/AES, XRF, AAS, …) when known.

#### Quantitation level

How quantitative the number is — separate from digestion:

| Level | Meaning |
|---|---|
| **Quantitative** | Measured value with stated precision |
| **Semi-quantitative** | Order-of-magnitude / preferred-value series |
| **Qualitative** | Presence / absence / “trace” only |
| **Unknown** | Not recorded |

Do not call a result “quantitative” if the lab reported it as semi-quantitative spectrography.

#### Keep the source wording (verbatim)

Always preserve, as free text when you have it:

| Field | Why |
|---|---|
| Source method code | Exact published code (e.g. `ME-ICP61`, `FA50`) |
| Source method description | Lab text that justified your mapping |
| Laboratory code | Same code can mean different things in different labs |
| Source unit | As published (audit for ppm ↔ wt%) |
| Sample weight (g) | Matters for fire assay (FA25 vs FA50) |
| Analysis date | Era / cohort |
| Source analysis id | So you can rejoin the original export later |
| Digestion notes | Package variants, microwave, reagent strengths, … |

Controlled lists describe **chemistry**. Source codes stay **free text** — every survey invents its own codes.

### 3. Concentrations

For each analyte on each analysis:

- Element **or** oxide (from LithoSurfer’s lists)
- Reported **concentration** (do not overwrite with a “corrected” total)
- **Relative operator** when the lab flagged below/above detection (`<`, `>`)
- **Detection limit** when the source publishes it (same unit as the value)
- Do **not** invent a detection limit for bare zeros — treat those as quality issues, not as `<DL`

---

## Preparing your spreadsheet or export

Organize so that each level is unambiguous:

1. **One row per sample** (or a clear sample table) with location and sample metadata.
2. **One row per analysis** linking to the sample, carrying method / digestion / quantitation / source codes.
3. **One row per analyte** linking to the analysis (wide element columns are fine if your loader pivots them).

Before upload, check:

- [ ] Target **data package** is writable for you ([packages and access](../../01_using-the-api/packages-and-access.md)).
- [ ] Every analysis that has chemistry also has a digestion category (use **Unknown** if truly unknown — do not leave it blank if you can avoid it).
- [ ] Four-acid / HF methods are **Near-total**, not Total.
- [ ] Fire assay Au/PGE is under **Fire assay**, not mixed into fusion totals for other elements.
- [ ] Semi-quantitative historic data is tagged as such.
- [ ] Source method codes are retained, not discarded after mapping.
- [ ] Below-detection values keep their `<` (or equivalent) and DL when known.

---

## What LithoSurfer will *not* do for you

- It will not convert aqua regia to a “total equivalent”.
- It will not guess digestion from the element list alone.
- It will not treat all “Ti ppm” columns as the same layer if digestion differs.
- It will not silently fix mixed units — keep an audit of the published unit.

---

## Upload paths

| Path | When to use | Doc |
|---|---|---|
| **Excel / table wizard** in the UI | Moderate volumes; interactive mapping | Ask Lithodat for the current geochem template |
| **Batch REST API** | Large volumes (thousands+); repeatable loads | [upload-via-api](upload-via-api/README.md) |

Either path needs the **same geological preparation**. The API only changes *how* records are sent.

---

## Getting help

| Question | Who |
|---|---|
| Data package / access | Your institution admin or Lithodat |
| Mapping a lab package to digestion lists | Lithodat (geochem / data team) |
| API errors during bulk load | Lithodat, with package id, counts, and error text |

Related: [Create data packages](../create-datapackages/) (when available) · [Using the API](../../01_using-the-api/)
