# Concentration thresholds (working draft)

**Status:** working document for expert review — not signed off.  
**Treat as the source of truth for numbers** until this page is replaced by an agreed table.

These are the values currently circulating (August 2026). Use this page to keep, change, or drop each rule. Empty cells in **Expert decision** are for you.

| | |
|---|---|
| Spreadsheet | *GC Upload Rules (1).xlsx*, dated 10 Aug 2026 (365 element rules, 190 oxide rules) |
| Later write-up | Staff validation-flags note (19 Aug 2026) — same counts, same fatal/warning split; no replacement numbers |
| Canonical units | Elements **ppm**; oxides and Total **wt%** |
| Related | [Quality checks](quality-checks.md) — sentinels, units, spectrography, flag-don’t-fix |

How a flag is applied is **not** a threshold, but experts need it when judging the numbers:

1. Standardise units first, then test. A warning high of 5,000 ppm is meaningless against a value still in wt%.
2. Handle sentinels (`-9999`, `-999`, `-1`, `999`/`9999`, bare `0`) **before** range rules. Otherwise every sentinel fails Fatal `< 0`.
3. Suppress **low** warnings on censored values (`< DL`). The number is a limit, not a measurement.
4. Fatal is never relaxed by province or lithology. Warning **may** be, once experts say so.
5. Flag and keep. Do not rewrite or delete. High values are often mineralisation.

---

## Remarks for review (read these first)

These are the comments from the internal review of the circulating table. They are the reason this is a draft, not a live gate.

**Keep as-is (proposal)**

- Fatal `< 0` and Fatal above 100% (oxides) / 1,000,000 ppm (elements). Physical ceiling.
- Total **warning** outside 90–105 wt% and **fatal** above 130 wt%. More realistic for mixed survey data than a 97–103 closure band.
- Low-side warnings on **majors** (Si, Al, Fe, Ca, K, Mg, Mn). These are the unit-error trap: Si as 60 instead of 600,000 ppm means someone skipped × 10,000.

**High-side warnings that will fire on real ore and ordinary rock**

| Analyte | Circulating warning high | Why it is noisy |
|---|---|---|
| Fe | 55,000 ppm (5.5 wt%) | Below typical basalt (~8–12 wt% Fe). Flags every mafic rock and all iron ore. |
| Pb, Zn, Ag | 5,000 ppm (0.5 wt%) | Galena, sphalerite, and silver ore sit well above this. |
| Au | 200 ppm (200 g/t) | Rare, but bonanza veins exist. Warning is acceptable; must not become Fatal. |
| Cu | 50,000 ppm (5 wt%) | Massive sulphide can exceed this. |
| Ti | 200,000 ppm (20 wt%) | Ilmenite ~31% Ti, rutile ~60%. Heavy-mineral sands will flag. |
| Sn, W | 500 ppm | Cassiterite / scheelite ore is much higher. |
| Sb | 100 ppm | Stibnite ore is much higher. |

If these stay, they need a documented suppression rule (mineralised province, ore lithology, or “warning only, never block”). Otherwise the QC report is dominated by the samples users care about.

**Low-side warnings that are not a unit-error signal**

| Analyte | Circulating warning low | Why it is noisy |
|---|---|---|
| Ag | 0.5 ppm | Crustal Ag is ~0.05 ppm. Almost all background fails. |
| Co | 30 ppm | Common in felsic rocks. Not a forgotten ×10,000. |

**Not geology**

- Warning high **> 1 ppm** on synthetic / superheavy elements (Am, Bh, Ts, Og, …) is periodic-table filler. Exploration assays do not report these.
- **FeO2** is not a standard reported oxide. Confirm whether it should be in the oxide list at all.

**Missing from the spreadsheet (do not invent here — track as open)**

- Sentinel list and “strip before Fatal `< 0`”.
- Route oxide vs element by analyte identity (`LOxide` / `LElement`), never by unit.
- Spectrography fingerprint (`1, 1.5, 2, 3, 5, 7 × 10ⁿ`) lives on [Quality checks](quality-checks.md), not in this table.

**Open question vs the quality-checks page**

[Quality checks](quality-checks.md) still cites a **97–103 wt%** major-oxide closure band. This table’s circulating Total rule is **warning < 90 or > 105**, **fatal > 130**. Experts should pick one story.

---

## Universal rules

Same for every analyte unless the per-analyte table says otherwise.

| Domain | Unit | Warning low | Warning high | Fatal low | Fatal high |
|---|---|---|---|---|---|
| Every element | ppm | — (only the 11 listed below) | see element table | `< 0` | `> 1,000,000` |
| Every oxide except Total | wt% | — | — | `< 0` | `> 100` |
| Total | wt% | `< 90` | `> 105` | `< 0` | `> 130` |

---

## Elements (ppm)

118 analytes. Fatal low / Fatal high are the same for all rows; they are repeated so a reviewer can change one element without hunting the universal table.

**Expert decision:** `keep` / `change` (write the new number) / `drop`.

| Element | Warning low | Warning high | Fatal low | Fatal high | Remarks | Expert decision |
|---|---|---|---|---|---|---|
| Ac | — | 100 | `< 0` | `> 1,000,000` | Radioactive / not a routine assay. | |
| Ag | 0.5 | 5,000 | `< 0` | `> 1,000,000` | **Low 0.5 ppm:** crustal Ag ~0.05 ppm — flags background, not a unit error. **High 5,000 ppm (0.5%):** real Ag ore is higher. | |
| Al | 55 | 400,000 | `< 0` | `> 1,000,000` | **Low 55 ppm:** good unit-error trap (wt% left as-is). **High 40%:** above typical bauxite (~28% Al) — OK as warning. | |
| Am | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Ar | — | 1,000 | `< 0` | `> 1,000,000` | Noble gas — not a routine assay. | |
| As | — | 22,000 | `< 0` | `> 1,000,000` | 2.2% As is arsenopyrite-territory. Warning OK if not Fatal. | |
| At | — | 500 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Au | — | 200 | `< 0` | `> 1,000,000` | 200 g/t. Bonanza grades exist. Keep as warning only. | |
| B | — | 200,000 | `< 0` | `> 1,000,000` | | |
| Ba | — | 5,000 | `< 0` | `> 1,000,000` | Barite is ~59% Ba. 0.5% will flag real Ba mineralisation. | |
| Be | — | 360,000 | `< 0` | `> 1,000,000` | Near beryl formula. High ceiling. | |
| Bh | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Bi | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Bk | — | 100 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Br | — | 10,000 | `< 0` | `> 1,000,000` | | |
| C | — | 200,000 | `< 0` | `> 1,000,000` | Carbonate / graphite / coal will exceed 20% C. | |
| Ca | 75 | 750,000 | `< 0` | `> 1,000,000` | **Low 75 ppm:** unit-error trap. **High 75%:** above calcite (~40% Ca) — OK as warning. | |
| Cd | — | 100 | `< 0` | `> 1,000,000` | | |
| Ce | — | 10,000 | `< 0` | `> 1,000,000` | | |
| Cf | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Cl | — | 500,000 | `< 0` | `> 1,000,000` | | |
| Cm | — | 100 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Cn | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Co | 30 | 48,000 | `< 0` | `> 1,000,000` | **Low 30 ppm:** felsic rocks commonly sit below this. Not a unit-error signal. High 4.8% is ore-grade. | |
| Cr | — | 10,000 | `< 0` | `> 1,000,000` | Chromite ore is much higher. | |
| Cs | — | 2,000 | `< 0` | `> 1,000,000` | | |
| Cu | — | 50,000 | `< 0` | `> 1,000,000` | **5 wt%.** Massive sulphide can exceed this. Warning only. | |
| Db | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Ds | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Dy | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Er | — | 3,000 | `< 0` | `> 1,000,000` | | |
| Es | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Eu | — | 3,000 | `< 0` | `> 1,000,000` | | |
| F | — | 500,000 | `< 0` | `> 1,000,000` | Fluorite is ~49% F. | |
| Fe | 100 | 55,000 | `< 0` | `> 1,000,000` | **High 5.5 wt% is the noisiest rule in the table.** Below typical basalt; flags all iron ore. **Low 100 ppm:** unit-error trap — keep. | |
| Fl | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Fm | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Fr | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Ga | — | 2,000 | `< 0` | `> 1,000,000` | | |
| Gd | — | 7,000 | `< 0` | `> 1,000,000` | | |
| Ge | — | 1,000 | `< 0` | `> 1,000,000` | | |
| H | — | 2,000 | `< 0` | `> 1,000,000` | Not a routine assay. | |
| He | — | 500 | `< 0` | `> 1,000,000` | Noble gas. | |
| Hf | — | 5,000 | `< 0` | `> 1,000,000` | | |
| Hg | — | 500 | `< 0` | `> 1,000,000` | | |
| Ho | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Hs | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| I | — | 500 | `< 0` | `> 1,000,000` | | |
| In | — | 500 | `< 0` | `> 1,000,000` | | |
| Ir | — | 10 | `< 0` | `> 1,000,000` | | |
| K | 50 | 500,000 | `< 0` | `> 1,000,000` | **Low 50 ppm:** unit-error trap. High 50% is above K-feldspar — OK as warning. | |
| Kr | — | 10 | `< 0` | `> 1,000,000` | Noble gas. | |
| La | — | 5,000 | `< 0` | `> 1,000,000` | REE ore can exceed 0.5% La. | |
| Li | — | 50,000 | `< 0` | `> 1,000,000` | Spodumene / brine Li can exceed 5%. | |
| Lr | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Lu | — | 300 | `< 0` | `> 1,000,000` | | |
| Lv | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Mc | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Md | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Mg | 50 | 500,000 | `< 0` | `> 1,000,000` | **Low 50 ppm:** unit-error trap. High 50% is above magnesite — OK as warning. | |
| Mn | 50 | 500,000 | `< 0` | `> 1,000,000` | **Low 50 ppm:** unit-error trap. High 50% will flag Mn ore. | |
| Mo | — | 600,000 | `< 0` | `> 1,000,000` | ~ molybdenite formula (60% Mo). High ceiling — OK. | |
| Mt | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| N | — | 170,000 | `< 0` | `> 1,000,000` | | |
| Na | — | 600,000 | `< 0` | `> 1,000,000` | | |
| Nb | — | 5,000 | `< 0` | `> 1,000,000` | Pyrochlore / columbite ore can exceed 0.5% Nb. | |
| Nd | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Ne | — | 500 | `< 0` | `> 1,000,000` | Noble gas. | |
| Nh | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Ni | — | 10,000 | `< 0` | `> 1,000,000` | Komatiite / sulphide Ni ore can exceed 1%. | |
| No | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Np | — | 5 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| O | 60 | 600,000 | `< 0` | `> 1,000,000` | Rarely reported as an element. Low 60 ppm is not a useful unit trap. | |
| Og | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Os | — | 100 | `< 0` | `> 1,000,000` | | |
| P | — | 300,000 | `< 0` | `> 1,000,000` | Apatite / phosphorite can exceed 30% P. | |
| Pa | — | 100 | `< 0` | `> 1,000,000` | Radioactive / not a routine assay. | |
| Pb | — | 5,000 | `< 0` | `> 1,000,000` | **0.5 wt%.** Galena ore is tens of %. Warning will flag Pb deposits. | |
| Pd | — | 10 | `< 0` | `> 1,000,000` | | |
| Pm | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Po | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Pr | — | 9,000 | `< 0` | `> 1,000,000` | | |
| Pt | — | 10 | `< 0` | `> 1,000,000` | | |
| Pu | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Ra | — | 10 | `< 0` | `> 1,000,000` | Radioactive / not a routine assay. | |
| Rb | — | 10,000 | `< 0` | `> 1,000,000` | | |
| Re | — | 100 | `< 0` | `> 1,000,000` | | |
| Rf | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Rg | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Rh | — | 100 | `< 0` | `> 1,000,000` | | |
| Rn | — | 10 | `< 0` | `> 1,000,000` | Noble gas. | |
| Ru | — | 10 | `< 0` | `> 1,000,000` | | |
| S | 60 | 600,000 | `< 0` | `> 1,000,000` | **Low 60 ppm:** not a major-element unit trap. High 60% ≈ native S / massive sulphide — OK as warning. | |
| Sb | — | 100 | `< 0` | `> 1,000,000` | Stibnite ore is much higher. | |
| Sc | — | 20,000 | `< 0` | `> 1,000,000` | | |
| Se | — | 500 | `< 0` | `> 1,000,000` | | |
| Sg | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Si | 50 | 500,000 | `< 0` | `> 1,000,000` | **Low 50 ppm:** the main unit-error trap. **High 50%:** just above quartz (~46.7% Si) — reasonable. | |
| Sm | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Sn | — | 500 | `< 0` | `> 1,000,000` | Cassiterite ore is much higher. | |
| Sr | — | 10,000 | `< 0` | `> 1,000,000` | | |
| Ta | — | 2,000 | `< 0` | `> 1,000,000` | | |
| Tb | — | 1,000 | `< 0` | `> 1,000,000` | | |
| Tc | — | 100 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| Te | — | 10 | `< 0` | `> 1,000,000` | | |
| Th | — | 10,000 | `< 0` | `> 1,000,000` | | |
| Ti | — | 200,000 | `< 0` | `> 1,000,000` | **20 wt%.** Ilmenite ~31% Ti, rutile ~60%. Heavy-mineral sands will flag. | |
| Tl | — | 10 | `< 0` | `> 1,000,000` | | |
| Tm | — | 300 | `< 0` | `> 1,000,000` | | |
| Ts | — | 1 | `< 0` | `> 1,000,000` | Synthetic. Filler. | |
| U | — | 10,000 | `< 0` | `> 1,000,000` | U ore can exceed 1%. | |
| V | — | 50,000 | `< 0` | `> 1,000,000` | | |
| W | — | 500 | `< 0` | `> 1,000,000` | Scheelite / wolframite ore is much higher. | |
| Xe | — | 500 | `< 0` | `> 1,000,000` | Noble gas. | |
| Y | — | 10,000 | `< 0` | `> 1,000,000` | | |
| Yb | — | 3,000 | `< 0` | `> 1,000,000` | | |
| Zn | — | 5,000 | `< 0` | `> 1,000,000` | **0.5 wt%.** Sphalerite ore is tens of %. Warning will flag Zn deposits. | |
| Zr | — | 510,000 | `< 0` | `> 1,000,000` | ~ zircon formula (Zr ~49%). High ceiling — OK. | |

Only **11 elements** have a warning low: Ag, Al, Ca, Co, Fe, K, Mg, Mn, O, S, Si.

---

## Oxides and Total (wt%)

Every oxide in the circulating list has the same two fatals: `< 0` and `> 100`. There are no per-oxide warning highs or lows except **Total**.

| Analyte | Warning low | Warning high | Fatal low | Fatal high | Remarks | Expert decision |
|---|---|---|---|---|---|---|
| Total | 90 | 105 | `< 0` | `> 130` | More realistic than 97–103 for mixed survey files. Align with [Quality checks](quality-checks.md) once agreed. A sum far below 90 usually means incomplete majors or a partial digest, not a “bad” rock. | |
| Each oxide in the list below | — | — | `< 0` | `> 100` | Physical ceiling for a single oxide. | |

Exact circulating list (93 oxides + Total = 94 names):

Ag2O, Al2O3, As2O3, As2O5, Au2O, B2O3, BaO, BeO, Bi2O3, Bi2O5, Br_Raw, CO2, CaO, CdO, Ce2O3, CeO2, Cl_Raw, CoO, Cr2O3, Cs2O, CuO, Dy2O3, Er2O3, Eu2O3, F_Raw, Fe2O3, FeO, **FeO2**, FeOT, Ga2O3, Gd2O3, H2O, HfO2, HgO, Ho2O3, I_Raw, In2O3, IrO, K2O, LOI, La2O3, Li2O, Lu2O3, MgO, MnO, N2O5, Na2O, Nb2O5, Nd2O3, NiO, O2, OH, OsO, P2O5, PbO, PdO, Pr2O3, Pr6O11, PtO, Rb2O, ReO, RhO, RuO, SO2, SO3, Sb2O3, Sb2O5, Sc2O3, SeO3, SiO2, Sm2O3, SnO, SnO2, SrO, Ta2O5, Tb2O3, Tb4O7, TcO, TeO3, ThO, ThO2, TiO2, Tm2O3, U2O3, U3O8, UO2, UO3, V2O5, WO3, Y2O3, Yb2O3, ZnO, ZrO2.

**Names that are not standard reported oxides — candidates to drop or reclassify**

| Name | Issue |
|---|---|
| FeO2 | Not a standard iron oxide. Labs report FeO, Fe2O3, or Fe2O3(T) / FeOT. |
| FeOT | Total iron as FeO — keep if that is how LithoSurfer stores it; confirm it is not double-counted with FeO / Fe2O3 in Total. |
| Br_Raw, Cl_Raw, F_Raw, I_Raw | Halogens, not oxides. Naming looks like a spreadsheet artefact. |
| CO2, H2O, OH, LOI, O2, SO2, SO3 | Volatiles / loss-on-ignition, not oxides. Confirm they belong on this sheet versus a separate volatile check. |
| Ag2O, Au2O | Rarely reported as oxides in exploration assays. |
| TcO | Technetium — not a routine assay. |

---

## What we are asking experts to decide

1. **Fe warning high** — raise it (suggestion: ~150,000–200,000 ppm / 15–20 wt% if the intent is “not magnetite ore”), or keep 55,000 ppm and document that mafic rocks will always warn.
2. **Pb, Zn, Ag, Cu, Au, Ti** warning highs — keep as mineralisation flags, or raise to ore-formula / bonanza ceilings.
3. **Ag < 0.5 ppm** and **Co < 30 ppm** — drop, or keep only as optional informational flags.
4. **Synthetic / noble-gas rows** — keep for completeness, or drop from the live gate.
5. **Total 90–105 / 130** versus the 97–103 band on the quality-checks page.
6. **Non-standard oxide names** — FeO2, Br_Raw / Cl_Raw / F_Raw / I_Raw, volatiles (LOI, H2O, CO2, OH, O2), Ag2O / Au2O, TcO: keep, reclassify, or drop.
7. **Province / lithology suppression** for warnings — yes/no, and who maintains the list.

When this page is signed off, copy the agreed numbers into implementation and tighten [Quality checks](quality-checks.md) so the two documents tell the same story.
