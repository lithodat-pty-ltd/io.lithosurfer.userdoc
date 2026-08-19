# Quality checks (geochemistry)

Checks to run on a geochemistry export **before** it is loaded — and when interpreting data that is already in LithoSurfer.

**Flag, never fix.** A suspect value gets a note and a reason, not a silent deletion or a rewritten number. LithoSurfer will not convert methods, invent detection limits, or repair mixed units for you.

These checks do not replace mapping digestion and quantitation. They catch values that cannot be what they claim to be.

| Related | Doc |
|---|---|
| What the fields mean | [Geochemistry](./) |
| Shaping an export for upload | [Preparing geochemistry data](../../03_contributing-data/upload-geochemistry-data/) |

---

## Sentinels

Values such as **`-9999`**, **`-999`**, **`-1`**, and repeated **`999`** / **`9999`** are fill codes, not measurements. Surveys differ — profile the file rather than assuming one list.

Do not convert a sentinel into `<` plus a detection limit. Flag it and keep it out of statistics.

A bare **`0`** with no `<` operator is the same class of problem: it is not a geochemical measurement. Do not infer a detection limit for it.

---

## Physical plausibility

A concentration above **1,000,000 ppm** (100 wt%) is impossible. Above roughly 700,000 ppm is implausible for anything but native metal.

Negatives that are not published as sentinels are errors.

A cluster sitting exactly at a round ceiling (1,000,000, 100, 99.99) often means a field limit or a decimal error, not a real assay.

---

## Major-oxide closure

Where the majors are present and in **wt%**, sum:

```
SiO₂ + TiO₂ + Al₂O₃ + Fe₂O₃(T) + MnO + MgO + CaO + Na₂O + K₂O + P₂O₅ + LOI
```

A total analysis lands near 100 wt%. Flag outside roughly **97–103**. A sum far below 90 means the majors are incomplete or the digest was partial.

This check needs no method metadata, which makes it the one test that still works when digestion is missing.

---

## Converted majors off by orders of magnitude

Elements go to **ppm**, oxides to **wt%**. wt% × 10,000 → ppm; ppb ÷ 1,000 → ppm.

If a converted major sits orders of magnitude below crustal abundance — SiO₂ as 60 ppm instead of ~60 wt%, Al as 8 ppm instead of ~8 wt% — the wt% → ppm step was skipped.

**Route oxide versus element by analyte identity** (`LOxide` vs `LElement`), never by unit. Routing by unit sends wt% Fe to the oxide lookup, where it fails silently.

Convert the **detection limit in lockstep** with the value. A limit left in the old unit is worse than no limit.

Keep `sourceUnit` as published.

---

## Historic spectrography fingerprint

Semi-quantitative historic **arc emission spectrography** (often labelled AES, spectrographic, or arc; roughly 1950s–1980s) reported on a preferred-value series:

**1, 1.5, 2, 3, 5, 7 × 10ⁿ**

A reported 200 means “roughly 150 to 300”. No geological process produces that quantisation: the values sit on those six mantissas, and a large file has only a few dozen distinct numbers.

Per cohort (dataset × analyte × method × era):

- share of values whose mantissa rounds to one of `{1.0, 1.5, 2.0, 3.0, 5.0, 7.0}`
- ratio of distinct values to record count

A cohort where **over ~85%** of values sit on that series, with a distinct-value ratio under ~0.05, is **Semi-quantitative**, whatever the method metadata says. Tag it; do not promote it to Quantitative.

This is the fingerprint that the [quantitation](./#quantitation-level) vocabulary refers to as a “preferred series”.

---

## What to do with the flags

Record which check fired and why. Do not drop the row from the load unless the user asks. High values are often the ones exploration users pay to find; deleting them because they look like outliers is biased against mineralisation.
