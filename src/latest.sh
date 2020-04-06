#!/bin/bash

set -eo pipefail

echo "[notice] Version update found, update latest"
cd out
cp ../docs/docs.json latest.json
git add .
git commit -m "Update 'latest' for version ${refName}: ${GITHUB_SHA}"
