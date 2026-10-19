# Build steps — IDTideChart

Checklist for cutting a release. For what the script does see
[README.md](README.md). Not a PluginInstaller/Store product: no manifest, no
`.tpkg`. The release is a notarized zip committed to this repo's
`Releases/` folder, which README.md links to on GitHub. This file is never
shipped: `makeIDTideChartRelease.command` copies an explicit file list into
the zip and this file is not on it.

## Version

[`Version.txt`](Version.txt) line 1 is the source of truth — the zip name
`IDTideChart.<version>.zip` comes from it. README.md's "Installing" section
links to that zip by name, so it has to be bumped by hand to match.

## Steps

1. **Refresh CRDT_ES** — `CRDT_ES` must be checked out next to this repo
   with its `.nzip` cut (`CRDT_ES/scripts/makerelease.command`).

2. **Bump** `Version.txt` line 1, and the two `IDTideChart.<version>.zip`
   links in README.md's "Installing" section.

3. **Build:**
   ```bash
   ./makeIDTideChartRelease.command
   ```
   Needs `TIGHTENER_GIT_ROOT` and the `ROROHIKO_NOTARY_*` variables
   (`Tightener/BuildScripts/setEnvLocal`). Rebuilds `libs/` (git-ignored):
   `JSXGetURLLoader.jsx` from `https://rorohiko.com/downloads/JSXGetURL.zip`,
   `crdtes.jsx`, `crdtesDLLLoader.jsx` and the `ARM64`/`mac64`/`win32`/`win64`
   TightenerESDLL folders from `../CRDT_ES/scripts/CreativeDeveloperTools_ES.nzip`.
   Stops with an error if any of those is missing, then zips `libs/`,
   `json2.js`, `TideChart.idml`, `TideChart.jsx` and `README.md` into
   `Releases/IDTideChart.<version>.zip` and submits it for notarization.

4. **Check the zip** before committing — it must contain `libs/` with the
   loaders and all four platform folders (a release without them fails on
   the first `//@include "libs/..."`):
   ```bash
   unzip -l Releases/IDTideChart.<version>.zip
   ```

5. **Publish** — remove the previous version's zip from `Releases/`, then
   commit `Releases/`, `Version.txt` and `README.md` and push to the
   `github.com` remote. The GitHub link in README.md is the download.
