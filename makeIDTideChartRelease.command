#!/bin/bash

if [ `uname` != "Darwin" ]; then
    echo Needs to run on Mac
    exit 1
fi

. "${TIGHTENER_GIT_ROOT}BuildScripts/setEnv"

set -euo pipefail

echo "makeIDTideChartRelease started"

export SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR"
export SCRIPT_DIR=`pwd`/

fail() {
    echo "Error: $1" >&2
    exit 1
}

CRDT_ES_NZIP="${SCRIPT_DIR}../CRDT_ES/scripts/CreativeDeveloperTools_ES.nzip"
[ -f "${CRDT_ES_NZIP}" ] || fail "${CRDT_ES_NZIP} not found - check out CRDT_ES next to this repo and run its scripts/makerelease.command"

# libs/ = JSXGetURLLoader.jsx from the published JSXGetURL download, plus
# crdtes.jsx, crdtesDLLLoader.jsx and the native TightenerESDLL folders from
# CRDT_ES. Both loaders load the same TightenerESDLL out of libs/; the
# CRDT_ES build includes JSXGetURL's CURL code and matches crdtes.jsx.

rm -rf libs JSXGetURL.zip JSXGetURLUnzip CreativeDeveloperTools_ESUnzip
mkdir libs

curl -fsSL https://rorohiko.com/downloads/JSXGetURL.zip --output JSXGetURL.zip
unzip -q JSXGetURL.zip -d JSXGetURLUnzip
cp JSXGetURLUnzip/JSXGetURL.*/JSXGetURL/JSXGetURLLoader.jsx libs/
rm -rf JSXGetURLUnzip JSXGetURL.zip

unzip -q "${CRDT_ES_NZIP}" -d CreativeDeveloperTools_ESUnzip
cp    CreativeDeveloperTools_ESUnzip/CreativeDeveloperTools_ES/crdtes.jsx          libs/
cp    CreativeDeveloperTools_ESUnzip/CreativeDeveloperTools_ES/crdtesDLLLoader.jsx libs/
for platformDir in ARM64 mac64 win32 win64; do
    cp -R "CreativeDeveloperTools_ESUnzip/CreativeDeveloperTools_ES/${platformDir}" libs/
done
rm -rf CreativeDeveloperTools_ESUnzip

for required in JSXGetURLLoader.jsx crdtes.jsx crdtesDLLLoader.jsx \
                ARM64/TightenerESDLL_ARM64R.dll \
                mac64/TightenerESDLL_x64R.framework \
                win32/TightenerESDLL_x32R.dll \
                win64/TightenerESDLL_x64R.dll; do
    [ -e "libs/${required}" ] || fail "libs/${required} missing after refresh"
done

export VERSION=`head -n 1 Version.txt`
export ARCHIVE="IDTideChart.${VERSION}"
rm -rf "${ARCHIVE}"
mkdir "${ARCHIVE}"
cp -R libs                      "${ARCHIVE}"
cp    json2.js                  "${ARCHIVE}"
cp    TideChart.idml            "${ARCHIVE}"
cp    TideChart.jsx             "${ARCHIVE}"
cp    README.md                 "${ARCHIVE}"

find "${ARCHIVE}" -name ".DS_Store" | while read a; do rm "$a"; done
find "${ARCHIVE}" -name "__MACOSX" | while read a; do rm -rf "$a"; done

xattr -cr "${ARCHIVE}"

if [ ! -d Releases ]; then
    mkdir Releases
fi

rm -f "Releases/${ARCHIVE}.zip"
zip -q -r -y "Releases/${ARCHIVE}.zip" "${ARCHIVE}"

rm -rf "${ARCHIVE}"

xcrun notarytool submit --password ${ROROHIKO_NOTARY_PASSWORD}  --apple-id ${ROROHIKO_NOTARY_APPLE_ID} --team-id ${ROROHIKO_NOTARY_TEAM_ID} --wait "Releases/${ARCHIVE}.zip"

echo "makeIDTideChartRelease done"
