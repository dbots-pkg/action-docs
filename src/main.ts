import { setFailed } from '@actions/core'
import { execSync, execFileSync } from 'child_process'
import { valid as validSemver } from 'semver'
import { desc as semverSort } from 'semver-sort'
import { join as path } from 'path'

const {
  GITHUB_ACTOR,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
} = process.env

const options = {
  env: {
    refName: GITHUB_REF?.split('/').pop(),
    repo: `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`,
    sourceType: GITHUB_REF?.split('/')[1] == 'heads' ? 'branch' : 'tag',
    targetBranch: 'docs',
  }
}

try {
  runFile('setup.sh')
  runFile('tagged.sh')

  const { env: { refName, sourceType } } = options
  if (sourceType == 'tag' && validSemver(refName) && refName == getLastTag())
    runFile('latest.sh')

  runFile('post.sh')
}
catch (e) {
  const error =
    e instanceof Buffer ? e.toString() :
      e.stderr ||
        typeof e == 'object' ? JSON.stringify(e) :
        e
  setFailed(error)
}

function runFile(name: string) {
  return execFileSync(path(__dirname, '../src', name), options)
}

function getLastTag(): string {
  const tags = execSync('git tag')
    .toString()
    .split('\n')
    .filter(validSemver)

  return semverSort(tags)[0]
}
