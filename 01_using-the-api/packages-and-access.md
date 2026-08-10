# Packages and access

A **data package** is the **access-control** container: samples and data points each reference a package via `dataPackageId`. That decides who may view or edit them. It is not the scientific parent of a sample — the subject-matter chain (sample → data point → measurements) is described in [Data hierarchy](data-hierarchy.md).

API create / update / delete all check package access (“bouncer”).

## Writable vs viewable

| Access | What you can do |
|---|---|
| **Viewable** | Read / search / map (depending on distribution and your roles) |
| **Writable** | Create, update, and delete content in that package |

**You can only create or change data in packages that are writable for you.**  
You may still *see* packages you cannot edit (e.g. public or shared data).

Typical ways a package is writable:

- You are an **editor** or **supervisor** on the package team, or  
- You have a **curator** role covering that package’s institution  

…and the package is not locked:

| Workflow state | Create / update / delete content? |
|---|---|
| Normal / in progress | Yes (if writable for you) |
| **FINISHED** | No |
| **FROZEN** | No |

## Practical consequences

- Put each import into a package you can write (often a dedicated package for that load).
- **Updating** a record requires a writable package. Moving a record to another package requires write access to **both** the current and the destination package — see [`03_writing-data/update-data/`](../03_writing-data/update-data/).
- Child records (concentrations, etc.) inherit the parent’s package rules: if the analysis is not in a writable package, you cannot change its children.
- Rejection messages often look like *Package is not writable by user* — ask your package admin for editor access, or use another package.

## Finding the package id

Use Swagger / management endpoints for data packages, or ask your institution admin / Lithodat contact for the numeric **data package ID** you should write to.
