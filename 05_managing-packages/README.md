# Managing packages

How a data package is created, staffed, filled, locked, published, cited, and deleted, and what the **editor**, **supervisor**, and **curator** are allowed to do.

These pages describe the rules the server enforces. They do not describe a particular screen. Who may see a package is summarised in [Packages and access](../01_using-the-api/packages-and-access.md).

| Page | Topic |
|---|---|
| This page | Package lifecycle, team roles, workflow, DOI, and deletion |
| [Curation](curation.md) | Asking for review, the curator's decision, and publishing |
| [EarthBank curation requirements](earthbank-curation.md) | Metadata and checks expected of a curated EarthBank package |
| [Licensing](licensing.md) | The `DataLicense` catalogue entry linked from a package |
| [Catalogue](catalogue/) | Finding packages, counting what they contain, and downloading the package ZIP |

## Package settings

A package carries three independent settings:

| Setting | Values | What it decides |
|---|---|---|
| **Workflow** | `IN_PROGRESS`, `FINISHED`, `FROZEN` | Whether the package's content, and then the package record itself, can still be changed |
| **Curation** | `NOT_CURATED`, `WAITING_FOR_CURATION`, `CURATED` | Whether the package has passed review. When the owning institution has a curator, review is required before the package can be made public. See [Curation](curation.md) |
| **Distribution** | `PRIVATE`, `HIDDEN`, `PUBLIC`, `COMMUNITY`, `COMMERCIAL` | Who can see the package. See [Packages and access](../01_using-the-api/packages-and-access.md) |

## Roles

Editor and supervisor are seats on the **package team**. Curator is a role on an **institution**, held through the person's link to that institution. One person can curate more than one institution. Curator is not a seat on the package team.

The person who creates a package becomes its first supervisor and its first **contact**. A contact receives messages sent to the package. A contact does not gain edit rights from that role. Supervisors add and remove contacts.

| | Editor | Supervisor | Curator of the owning institution |
|---|---|---|---|
| Create, update, and delete samples and data points while the workflow is `IN_PROGRESS` | Yes | Yes | Only while curation is `WAITING_FOR_CURATION` |
| Change the package record (name, description, distribution, workflow, curation comment) | | Yes | Yes, including after curation has finished |
| Add or remove editors, supervisors, and contacts | | Yes | |
| Ask for curation, while it is `NOT_CURATED` and they can view the package | Yes | Yes | Yes |
| Mark the package `CURATED` | | | Yes. An administrator may also do this |
| Set distribution to `PUBLIC` | | After the package is `CURATED`, or immediately when the institution has no curator | During curation, or afterwards |
| Assign or change the data licence | | Only when the institution has no curator | Yes, when the institution has a curator. An administrator may also do this |
| Mint a DOI, and update its metadata afterwards | | Yes | |
| Delete the package | | Yes, when it is `PRIVATE` and has no DOI | |

A frozen package rejects every later change to the package record. Content edits are refused for both `FINISHED` and `FROZEN`.

## Lifecycle

### 1. Create

A person who belongs to an institution can create a package. A person who is not yet on any package team can also create one.

The new package is `PRIVATE`, `IN_PROGRESS`, and `NOT_CURATED`. Any other distribution on creation is rejected. The owning institution is the creator's institution. The creator is recorded as a supervisor and as a contact. The licence text starts as "Creative Commons"; assigning the structured data licence is a later step.

### 2. Build the team and the data

A supervisor adds further supervisors and editors. Each added or removed person is notified.

While the workflow stays `IN_PROGRESS`, editors and supervisors create and change the package contents. Samples and data points belong to the package through `dataPackageId`. Child records follow the parent package: if the package is not writable, its measurements are not writable either. Changing those records is covered in [Update data](../03_contributing-data/update-data/).

### 3. Lock the content

A supervisor or an institution curator sets the workflow.

| Workflow | Content | Package record | Reversible |
|---|---|---|---|
| `IN_PROGRESS` | Editors and supervisors can change it | Supervisor or curator can change it | — |
| `FINISHED` | Locked | Still changeable, so the workflow can return to `IN_PROGRESS` | Yes |
| `FROZEN` | Locked | Locked. A later update is rejected | No |

Freezing is the point at which a package is treated as citable, in the same way a paper is once it is printed. A supervisor may mint a DOI at any workflow state.

### 4. Review and publish

When the owning institution has a curator, the package is reviewed before it can be made public. The request, the wait, the curator's decision, and publication are described in [Curation](curation.md).

When the institution has no curator, a supervisor sets distribution to `PUBLIC` directly. Moving a package out of `PRIVATE` requires the acting user to belong to an institution. Making a package public notifies support and the curators of the owning institution. The notice names the package contacts.

### 5. Licence and DOI

The data licence is a catalogue entry linked from the package, plus a free-text field. The model is in [Licensing](licensing.md). When the institution has a curator, only a curator of that institution, or an administrator, may set or change the linked licence. The package must already have an owning institution.

A supervisor mints the package DOI and may update its DataCite metadata later. The supervisor must belong to an institution. A DOI is minted once. A package that has a DOI cannot be deleted: the DOI has to keep resolving. Withdrawal of such a package is handled with support.

### 6. Delete

A supervisor may delete a package that is `PRIVATE` and has no DOI. The package, its samples, and its data points are marked deleted. The supervisor is told when deletion finishes or fails.

## What each role does along the way

**Editor.** Writes the scientific content while the package is in progress, and can ask for curation when they can see the package. Package settings, the team, the licence, the DOI, and publication stay with the supervisor and the curator.

**Supervisor.** Owns the package. Builds the team, edits content, sets the workflow, asks for review, publishes after curation (or directly, when the institution has no curator), mints the DOI, and deletes a private package that has no DOI.

**Curator.** Reviews packages of their institution that are waiting, as described in [Curation](curation.md). They assign the data licence when their institution has a curator. They are notified when a package of their institution is made public.

## Related

- Who can see a package: [Packages and access](../01_using-the-api/packages-and-access.md)
- Review and publication: [Curation](curation.md)
- Data licence: [Licensing](licensing.md)
- Finding, counting, and downloading a package: [Catalogue](catalogue/)
- Changing records inside a writable package: [Update data](../03_contributing-data/update-data/)
