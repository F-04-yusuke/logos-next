#!/usr/bin/env python3
"""git commit 後に自動タグを付けるスクリプト (Claude Code hook用)"""
import sys, json, subprocess, re

try:
    data = json.load(sys.stdin)
    cmd = data.get("tool_input", {}).get("command", "")
    if "git commit" not in cmd:
        sys.exit(0)

    repo = "/home/tasaki/logos-next"
    result = subprocess.run(
        ["git", "-C", repo, "tag", "--sort=-v:refname"],
        capture_output=True, text=True
    )
    tags = [t for t in result.stdout.strip().split("\n") if re.match(r"^v[0-9]+\.[0-9]+", t)]
    if not tags:
        sys.exit(0)

    m = re.match(r"^v([0-9]+)\.([0-9]+)", tags[0])
    if not m:
        sys.exit(0)

    major, minor = m.group(1), int(m.group(2))
    new_tag = f"v{major}.{minor + 1}-session40-auto"
    subprocess.run(["git", "-C", repo, "tag", new_tag], capture_output=True)
except Exception:
    pass
