#!/bin/bash
set -e

echo "=== OtoReport: Build para Linux ==="

npm install
npx tauri build

echo "=== Build completado ==="
echo "Archivos en: src-tauri/target/release/bundle/"
