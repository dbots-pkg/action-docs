#!/bin/bash

set -eo pipefail

echo "[notice] Set up cloned repo"
git clone $repo out -b $targetBranch
cd out
git pull
git config --global user.name "${GITHUB_ACTOR}"
git config --global user.email "${GITHUB_ACTOR}@users.noreply.github.com"

echo "[notice] Build main file"
cp ../docs/docs.json $refName.json
git add .
git commit -m "Docs build for ${sourceType} ${refName}: ${GITHUB_SHA}"

if [ "$updateLatest" == "yes" ]; then
  echo "[notice] Version update found, update latest"
  cp ../docs/docs.json latest.json
  git add .
  git commit -m "Update 'latest' for version ${refName}: ${GITHUB_SHA}"
else
  echo "[notice] No version update found"
fi

echo "[notice] Push changes to repo"
git push origin ${targetBranch}
