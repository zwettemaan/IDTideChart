if [ `uname` != "Darwin" ]; then
    echo Needs to run on Mac
    exit
fi

. "${TIGHTENER_GIT_ROOT}BuildScripts/setEnv"

echo "makeIDTideMapRelease started"

export SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR"
export SCRIPT_DIR=`pwd`/

# Update modules

rm -f JSXGetURL.zip
curl https://rorohiko.com/downloads/JSXGetURL.zip --output JSXGetURL.zip

rm -rf JSXGetURLUnzip
ditto -xk --rsrc JSXGetURL.zip JSXGetURLUnzip

rm -rf JSXGetURL
mv JSXGetURLUnzip/JSXGetURL.*/JSXGetURL JSXGetURL

rm -rf JSXGetURLUnzip
rm -rf JSXGetURL.zip

rm -rf CRDT_ES
rm -rf CreativeDeveloperTools_ES
rm -rf CreativeDeveloperTools_ESUnzip

gh repo clone zwettemaan/CRDT_ES -- --depth 1

ditto -x -k --rsrc CRDT_ES/scripts/CreativeDeveloperTools_ES.nzip CreativeDeveloperTools_ESUnzip
mv CreativeDeveloperTools_ESUnzip/CreativeDeveloperTools_ES CreativeDeveloperTools_ES
rm -rf CreativeDeveloperTools_ESUnzip
rm -rf CRDT_ES

export VERSION=`head -n 1 Version.txt`
export ARCHIVE="IDTideMap.${VERSION}"
rm -rf "${ARCHIVE}"
mkdir "${ARCHIVE}"
cp -R CreativeDeveloperTools_ES "${ARCHIVE}"
cp -R JSXGetURL                 "${ARCHIVE}"
cp    json2.js                  "${ARCHIVE}"
cp    TideMap.indt              "${ARCHIVE}"
cp    TideMap.jsx               "${ARCHIVE}"
cp    README.md                 "${ARCHIVE}"

if [ ! -d Releases ]; then
    mkdir Releases
fi

rm -f "Releases/${ARCHIVE}.zip"
ditto -c -k --rsrc "${ARCHIVE}" "Releases/${ARCHIVE}.zip"

rm -rf "${ARCHIVE}"

xcrun notarytool submit --password ${ROROHIKO_NOTARY_PASSWORD}  --apple-id ${ROROHIKO_NOTARY_APPLE_ID} --team-id ${ROROHIKO_NOTARY_TEAM_ID} --wait "Releases/${ARCHIVE}.zip"

echo "makeIDTideMapRelease done"
