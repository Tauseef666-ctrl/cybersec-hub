#!/bin/bash
set -e

ROOTDIR="$(cd "$(dirname "$0")" && pwd)"
PROJ="$ROOTDIR/android"
BUILD="$PROJ/build"
ANDROID_JAR="$PROJ/toolz/android.jar"
BT="/data/data/com.termux/files/usr/opt/android-sdk/build-tools/36.1.0"
export PATH="$BT:$PATH"

echo "=== CyberSec Hub APK Builder ==="
echo "  Package: com.cybersec.hublearn"
echo "  App Name: cybersec-hub"
echo ""

if [ ! -f "$ANDROID_JAR" ]; then
  echo "ERROR: android.jar not found at $ANDROID_JAR"
  exit 1
fi

rm -rf "$BUILD"
mkdir -p "$BUILD"/{gen,obj,dex,apk}

echo "[1/6] Compiling resources..."
aapt package -f -m \
  -J "$BUILD/gen" \
  -M "$PROJ/AndroidManifest.xml" \
  -S "$PROJ/res" \
  -I "$ANDROID_JAR"

echo "[2/6] Compiling Java..."
SOURCES=$(find "$PROJ/src" "$BUILD/gen" -name "*.java" 2>/dev/null)
echo "  Sources: $(echo "$SOURCES" | wc -l) files"

javac --release 8 \
  -classpath "$ANDROID_JAR" \
  -d "$BUILD/obj" \
  $SOURCES

echo "[3/6] Creating DEX..."
CLASSES=$(find "$BUILD/obj" -name "*.class")
d8 --output "$BUILD/dex" \
  --lib "$ANDROID_JAR" \
  $CLASSES

echo "[4/6] Packaging APK..."
aapt package -f \
  -M "$PROJ/AndroidManifest.xml" \
  -S "$PROJ/res" \
  -A "$PROJ/assets" \
  -I "$ANDROID_JAR" \
  -F "$BUILD/apk/cybersec-hub-unsigned.apk"

cp "$BUILD/dex/classes.dex" "$BUILD/apk/"
cd "$BUILD/apk"
jar uf cybersec-hub-unsigned.apk classes.dex
cd "$PROJ"

echo "[5/6] Aligning APK..."
zipalign -f 4 \
  "$BUILD/apk/cybersec-hub-unsigned.apk" \
  "$BUILD/apk/cybersec-hub-aligned.apk"

echo "[6/6] Signing APK..."
KEYSTORE="$BUILD/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -storepass android \
    -alias cyberseckey \
    -keypass android \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Tauseef Khan,OU=Developer,O=CyberSec Hub,L=India,ST=India,C=IN" 2>/dev/null
fi

apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --ks-key-alias cyberseckey \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  "$BUILD/apk/cybersec-hub-aligned.apk"

OUTPUT="$PROJ/cybersec-hub.apk"
cp "$BUILD/apk/cybersec-hub-aligned.apk" "$OUTPUT"

echo ""
echo "================================="
echo "  BUILD SUCCESS!"
echo "================================="
echo "  APK: $OUTPUT"
echo "  Size: $(du -h "$OUTPUT" | cut -f1)"
echo "  Package: com.cybersec.hublearn"
echo "  App Name: cybersec-hub"
echo "  Version: 1.0"
echo "================================="
echo ""
echo "Install with:"
echo "  cp cybersec-hub.apk ~/storage/shared/"
echo "  termux-open ~/storage/shared/cybersec-hub.apk"
