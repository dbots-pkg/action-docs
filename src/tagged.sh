#!/bin/bash

set -eo pipefail

echo "[notice] Build main file"
cd out
cp ../docs/docs.json $refName.json
git add .
git commit -m "Docs build for ${sourceType} ${refName}: ${GITHUB_SHA}"
