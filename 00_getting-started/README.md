# Getting started

Set up an AI agent that can read this documentation **and** run scripts against the LithoSurfer API on your behalf. Budget about fifteen minutes for the first time.

Two halves: getting set up (steps 1–2 — install an agent, lay out your folders), then proving your LithoSurfer access works (steps 3–4). **Already using Claude Code or Cursor? Start at [step 2](#step-2--set-up-your-folders).**

At the end you will have run a script that lists the data packages you are allowed to write to — which proves your host, credentials and access all work before you attempt a real upload.

---

## Use Claude Code

This documentation assumes **[Claude Code](https://docs.claude.com/en/docs/claude-code/setup)**, a command-line agent that runs in your own terminal.

That last point is what matters. Claude Code executes scripts in *your* shell, so it inherits your network, your VPN and your environment variables. Chat-style assistants that run code in a hosted sandbox cannot reach a LithoSurfer instance on a private network, and cannot see credentials you set on your own machine.

Cursor, VS Code with an agent extension, and similar tools work the same way and are fine substitutes — everything below applies with only the install step changed.

---

## Step 1 — Install

**Windows** (PowerShell, no administrator rights needed):

```powershell
irm https://claude.ai/install.ps1 | iex
```

Also install **[Git for Windows](https://git-scm.com/download/win)**. Claude Code then uses Bash as its shell, so the commands in this documentation work as written instead of needing PowerShell equivalents.

**macOS / Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Then run `claude` once and follow the browser prompt to sign in.

---

## Step 2 — Set up your folders

Keep two folders side by side: this documentation, and your own work.

```bash
mkdir lithosurfer && cd lithosurfer
git clone https://github.com/lithodat-pty-ltd/io.lithosurfer.userdoc.git
mkdir my-import
```

```text
lithosurfer/
├── io.lithosurfer.userdoc/   ← this documentation: reference only, never edit
└── my-import/                ← your work: data, scripts, .env
```

**Treat the documentation clone as read-only.** Your scripts, data and credentials belong in your own folder. That keeps `git pull` clean forever — there is nothing local to conflict with — and keeps your lab data out of a repository you do not own.

Update the documentation at any time:

```bash
cd io.lithosurfer.userdoc && git pull && cd ..
```

Name `my-import` whatever suits the job — `rosebery-2026`, `tasmania-geochem`. Create a new one per project.

---

## Step 3 — Set your credentials

**Never paste a password into an agent chat window.** Anything you type there is stored in the conversation, may be echoed back in logs, and tends to end up hardcoded in the script the agent writes — one `git add` away from being published. A well-behaved agent will refuse, and it is right to.

The agent does not need your credentials. The *script* does. Set them yourself, once, **in your own project folder** — not in the documentation clone:

```bash
cp io.lithosurfer.userdoc/00_getting-started/.env.example my-import/.env
```

Edit `my-import/.env` and fill in your login:

```bash
LITHOSURFER_USER=you@example.org
LITHOSURFER_PASSWORD=your-password
LITHOSURFER_HOST=https://app.ausgeochem.org
```

The agent writes code that reads these variables by name and never has to see their values. If you ever put `my-import` under version control, add `.env` to its `.gitignore` first.

Prefer not to store the password at all? Leave `LITHOSURFER_PASSWORD` out and the script prompts for it each run.

| Setting | Notes |
|---|---|
| `LITHOSURFER_USER` | The email address you sign in to LithoSurfer with |
| `LITHOSURFER_PASSWORD` | Your password. Omit to be prompted instead |
| `LITHOSURFER_HOST` | Defaults to `https://app.ausgeochem.org`. Change it for another deployment |

---

## Step 4 — Run the first script

Run it from your own folder, so it picks up the `.env` you just created:

```bash
cd my-import
python ../io.lithosurfer.userdoc/00_getting-started/list_my_packages.py
```

It needs only Python 3.8+ and no third-party packages.

```text
Host: https://app.ausgeochem.org
User: you@example.org

2 writable data package(s):

      ID  WORKFLOW      DISTRIBUTION  NAME
--------  ------------  ------------  ----------------------------------------
   12345  IN_PROGRESS   PRIVATE       Rosebery geochem import 2026-08
   12801  FINISHED      PUBLIC        Tasmania regional survey

Note: package(s) 12801 are FINISHED or FROZEN and reject writes despite your access.

Use one of these IDs as dataPackageId when you upload.
```

The ID from this list is the `dataPackageId` every write operation needs.

| Result | Meaning |
|---|---|
| A list of packages | Everything works. Note the ID you intend to write into |
| `No writable data packages` | Login works, but you are not an editor on anything — ask your institution admin or Lithodat for editor access |
| `HTTP 401` | Wrong credentials, or the account is not activated on this host |
| `Could not reach …` | Wrong host name, or the instance needs a VPN connection |

---

## Step 5 — Hand over to the agent

Start the agent from the **parent** folder, so it can see the documentation and your project at once:

```bash
cd ~/lithosurfer
claude
```

Open every session by telling it which folder is which. This is the single most useful sentence you can type:

```text
Use ./io.lithosurfer.userdoc as reference documentation — read it, never
edit it. Do all work in ./my-import.
```

Then describe the task:

```text
Summarise how I upload geochemistry data.
```

```text
Using io.lithosurfer.userdoc/00_getting-started/list_my_packages.py as the
pattern for authentication, write a script in my-import/ that counts the
samples in data package 12345.
```

```text
I have a lab export at my-import/rosebery.xlsx. Walk me through preparing it
for upload, following 03_writing-data/upload-geochemistry-data/.
```

Three habits worth keeping:

- **Say where work goes.** Without it the agent may write into the documentation clone, and your next `git pull` will complain.
- **Refer to credentials by variable name**, never by value — `read LITHOSURFER_PASSWORD from the environment`, not the password itself.
- **Ask for a dry run first.** Batch uploads are all-or-nothing. Have the agent send a handful of records, check them in the UI, then run the rest.

---

## What the agent should know

Point it at these once it is running:

| Question | Doc |
|---|---|
| How the data model fits together | [Data hierarchy](../01_using-the-api/data-hierarchy.md) |
| Why a write was rejected | [Packages and access](../01_using-the-api/packages-and-access.md) |
| Exact endpoints and field names | [Endpoints and Swagger](../01_using-the-api/endpoints-and-swagger.md) |
| Turning `Zr` into the ID the API wants | [Reference lists](../01_using-the-api/reference-lists.md) |
| Loading many records at once | [Batch upload via API](../03_writing-data/batch-upload-via-api/) |

Swagger UI for the production host: <https://app.ausgeochem.org/swagger-ui.html>

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| The agent refuses to accept your password | You pasted it into the chat | Put it in `.env` instead (step 3) — the refusal is correct |
| The agent cannot run scripts, or reports a sandbox | You are using a hosted chat assistant, not Claude Code | Install Claude Code (step 1) |
| `python: command not found` | Python missing from PATH | Install Python 3, or try `python3` |
| Commands in the docs fail on Windows | Shell fell back to PowerShell | Install Git for Windows (step 1) |
| `HTTP 401` on every call | Token expired mid-session | Tokens are short-lived; re-run the script to fetch a new one |
| Empty search results you expected data in | The server filters by access before returning | Set `allowedAccess` on the query — see [packages and access](../01_using-the-api/packages-and-access.md) |
| `git pull` reports local changes in the docs clone | The agent wrote into the documentation folder | `git checkout .` there to discard, and tell the agent to work in your own folder (step 5) |
| The script cannot find your credentials | `.env` is not in the folder you ran from | Run from your project folder, or export the variables in your shell |
