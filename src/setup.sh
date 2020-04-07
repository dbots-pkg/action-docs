#!/bin/bash

set -eo pipefail

cd $GITHUB_WORKSPACE

echo "[notice] Run docs script"
npm run docs

echo "[notice] Set up cloned repo"
git clone $repo out -b $TARGET_BRANCH
cd out
git pull
git config user.name "${GITHUB_ACTOR}"
git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"


