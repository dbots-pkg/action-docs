#!/bin/bash

set -eo pipefail

echo "[notice] Push changes to repo"
cd out
git push origin ${targetBranch}
