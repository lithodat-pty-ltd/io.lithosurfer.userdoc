# EarthBank curation

What EarthBank curators confirm before a package is treated as curated, and what the package should carry on its landing page.

How a package moves through review in LithoSurfer is in [Curation](curation.md). EarthBank uses those states and actions. The AuScope EarthBank curation team carries out the review, and the curation editor leads that team. The practice and the quality bar below are what that team applies before they mark a package `CURATED`.

The landing-page list comes from the AusGeochem basic-curation note for data contributors and AGN curators. That note is the CoreTrustSeal appendix for **Level B, basic curation**: brief checking, plus basic metadata or documentation. It was drawn from the AuScope Data Repository deposit guidelines and from GFZ Data Services metadata practice.

## How EarthBank curates

The request email is the review thread. Every curator of the owning institution receives it, and replies go to the person who asked.

- The data contributor asks for review when the package is ready to be published.
- The curator checks the package against the quality bar and sends any requested changes in the reply. The contributor updates the package. The state stays `WAITING_FOR_CURATION`.
- When the contributor disputes a requested change, the curation editor resolves it.
- A curator who is an author of the package, or who has another conflict of interest, steps out of the review and arranges for another curator to take it.
- An embargo is an end date named in the thread. The curator chooses **Curate only**. A supervisor or a curator sets distribution to `PUBLIC` only after that date.
- The first review is completed within the agreed time.
- An AI tool may assist with the metadata check, the quality check, or the workflow. A member of the curation team makes the decision. When a tool was used, the curator tells the contributor and confirms the tool's output before acting on it.
- After the package is public, the contributor or a curator raises a correction with the curation team.

## Quality bar

The curator confirms the following before accepting the package. The curator records the check, including changes made during review, in the curation comment.

| Requirement | What is confirmed |
|---|---|
| Title and description | Both say what the package contains. When the data support a paper, the paper is cited from the package, and the title and description stay about the data |
| Kind of data resource | The package is canonical, reproduced, or compilation. The EarthBank Data Package Metadata Guide defines each kind |
| Metadata | The landing-page metadata is complete, accurate, and specific to this package. The fields are listed below |
| Reuse | A person outside the contributing group can understand the data and use it again |
| Licence | The package has a named data licence, for example CC BY 4.0. See [Licensing](licensing.md) |
| FAIR | The metadata lets others find the package, reach it, combine it with other data, and reuse it |
| CARE | For culturally sensitive or Indigenous data, the curator also applies the CARE Principles: Collective Benefit, Authority to Control, Responsibility, and Ethics |

## What the package should carry

| Item | Requirement |
|---|---|
| **Title** | Informative and short. Technical terms and acronyms are defined. |
| **Authors and contributors** | Full name, email, and affiliation of everyone who created or produced the dataset. ORCID where the person has one. Authors and contributors both stay searchable and connected to the package. People invited onto the package as collaborators are settled into this defined author list when the package is published. |
| **Description** | A summary of the purpose, nature, and scope. State the kind of data resource: canonical, reproduced, or compilation, as defined in the EarthBank Data Package Metadata Guide. Include DOIs of papers or URLs of other sources, and a short scientific background. |
| **User keywords** | Terms that help discovery. They are also filters in the data package catalogue. |
| **GCMD Science Keywords** | At least one keyword from the NASA Global Change Master Directory. These keywords are filters inside AusGeochem and when the package is exchanged with other repositories. |
| **Contact** | A lead-author address that package enquiries go to. |
| **Cite as** | A citation for the package. It may be typed in, generated from the package's own details, or taken from the journal paper when the data come from a publication. |

## What the curator checks

Basic curation follows the Data Curation Network **CURATE(D)** checklist, using three of its six steps.

| Step | What it means here |
|---|---|
| **C — Check** | Read the files and the documentation. Confirm the title, the description, references where the package has them, and the DOI. |
| **R — Request** | Ask the contributors for missing information or for changes. Keep a record of what changed and why. |
| **D — Document** | Write down the curation work, including fixes such as correcting a location. |

The other CURATE(D) steps — understand the data, augment the metadata, transform file formats, and a full FAIRness evaluation — are outside this basic checklist. The quality bar covers the FAIR confirmation, and CARE where the data call for it.

## Related

- How review and publication work in LithoSurfer: [Curation](curation.md)
- Package lifecycle and roles: [Managing packages](README.md)
- The data licence on a package: [Licensing](licensing.md)
