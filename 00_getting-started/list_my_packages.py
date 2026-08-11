#!/usr/bin/env python3
"""List the LithoSurfer data packages you are allowed to write to.

This is the "hello world" for the LithoSurfer API: it proves your host,
credentials and access all work before you attempt a real upload.

Usage:
    python list_my_packages.py

Credentials are read from environment variables, or from a .env file in
the folder you run this from (falling back to the folder holding this
script). Never pass them on the command line and never paste them into an
AI agent chat window - see README.md.

    LITHOSURFER_USER=you@example.org
    LITHOSURFER_PASSWORD=...
    LITHOSURFER_HOST=https://app.ausgeochem.org   # optional

Requires only the Python standard library (Python 3.8+).
"""

import getpass
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_HOST = "https://app.ausgeochem.org"
TIMEOUT = 60


def load_dotenv() -> None:
    """Load KEY=VALUE lines from a .env file.

    Looks in the current working directory first, so your credentials can
    live in your own project folder rather than in this documentation
    clone, then falls back to the folder holding this script.
    """
    candidates = [Path.cwd() / ".env", Path(__file__).resolve().parent / ".env"]
    for env_file in candidates:
        if not env_file.is_file():
            continue
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip("\"'")
            if value:
                os.environ.setdefault(key.strip(), value)


def request(method: str, url: str, body=None, token=None):
    """Send a JSON request and return the decoded response."""
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Accept": "application/json"}
    if data:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
        payload = response.read().decode("utf-8")
    return json.loads(payload) if payload else None


def authenticate(host: str, username: str, password: str) -> str:
    """Exchange username and password for a JWT."""
    body = {"username": username, "password": password, "rememberMe": False}
    result = request("POST", f"{host}/api/authenticate", body=body)
    token = result.get("id_token") if result else None
    if not token:
        raise SystemExit(f"Authentication response contained no id_token: {result}")
    return token


def writable_packages(host: str, token: str):
    """Return the data packages the authenticated user may write to."""
    url = f"{host}/api/management/data-packages/post?page=0&size=200&sort=name,asc"
    return request("POST", url, body={"allowedContentAccess": "WRITEABLE"}, token=token) or []


def main() -> int:
    load_dotenv()

    host = os.environ.get("LITHOSURFER_HOST", DEFAULT_HOST).rstrip("/")
    username = os.environ.get("LITHOSURFER_USER") or input("LithoSurfer user: ").strip()
    password = os.environ.get("LITHOSURFER_PASSWORD") or getpass.getpass("Password: ")

    print(f"Host: {host}")
    print(f"User: {username}")

    try:
        token = authenticate(host, username, password)
        packages = writable_packages(host, token)
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", "replace")[:400]
        if error.code == 401:
            print("\nHTTP 401 - the server rejected these credentials.", file=sys.stderr)
            print("Check LITHOSURFER_USER / LITHOSURFER_PASSWORD, and that your", file=sys.stderr)
            print("account is activated on this host.", file=sys.stderr)
        else:
            print(f"\nHTTP {error.code} {error.reason}\n{detail}", file=sys.stderr)
        return 1
    except urllib.error.URLError as error:
        print(f"\nCould not reach {host}: {error.reason}", file=sys.stderr)
        print("Check the host name, your network, and any VPN requirement.", file=sys.stderr)
        return 1

    if not packages:
        print("\nNo writable data packages.")
        print("You can sign in, but you are not an editor or supervisor on any package.")
        print("Ask your institution admin or Lithodat for editor access.")
        return 0

    print(f"\n{len(packages)} writable data package(s):\n")
    print(f"{'ID':>8}  {'WORKFLOW':<12}  {'DISTRIBUTION':<12}  NAME")
    print(f"{'-' * 8}  {'-' * 12}  {'-' * 12}  {'-' * 40}")

    locked = []
    for package in packages:
        identifier = package.get("id")
        name = package.get("name") or "(unnamed)"
        workflow = package.get("workflowState") or "-"
        distribution = package.get("distribution") or "-"
        if workflow in ("FINISHED", "FROZEN"):
            locked.append(identifier)
        print(f"{identifier:>8}  {workflow:<12}  {distribution:<12}  {name}")

    if locked:
        print(
            f"\nNote: package(s) {', '.join(str(i) for i in locked)} are FINISHED or FROZEN "
            "and reject writes despite your access."
        )

    print("\nUse one of these IDs as dataPackageId when you upload.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
