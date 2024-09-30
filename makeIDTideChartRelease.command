if [ `uname` != "Darwin" ]; then
    echo Needs to run on Mac
    exit
fi

. "${TIGHTENER_GIT_ROOT}BuildScripts/setEnv"

echo "makeIDTideChartRelease started"

export SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR"
export SCRIPT_DIR=`pwd`/

# Update libs

rm -rf libs

rm -f JSXGetURL.zip
curl https://rorohiko.com/downloads/JSXGetURL.zip --output JSXGetURL.zip

rm -rf JSXGetURLUnzip
unzip -q JSXGetURL.zip -d JSXGetURLUnzip

mv JSXGetURLUnzip/JSXGetURL.*/JSXGetURL libs

rm -rf JSXGetURLUnzip
rm -rf JSXGetURL.zip

rm -rf CRDT_ES
rm -rf CreativeDeveloperTools_ES
rm -rf CreativeDeveloperTools_ESUnzip

gh repo clone zwettemaan/CRDT_ES -- --depth 1

unzip -q CRDT_ES/scripts/CreativeDeveloperTools_ES.nzip -d CreativeDeveloperTools_ESUnzip
mv CreativeDeveloperTools_ESUnzip/CreativeDeveloperTools_ES/*.jsx libs

rm -rf CreativeDeveloperTools_ESUnzip
rm -rf CRDT_ES

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
