import { setFailed, info } from '@actions/core'
import { execSync } from 'child_process'
import { valid as validSemver } from 'semver'
import { desc as semverSort } from 'semver-sort'
import { join as path } from 'path'

const {
  GITHUB_ACTOR,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_SHA,
  GITHUB_TOKEN,
  GITHUB_WORKSPACE,
} = process.env

try {
  info('[notice] Run docs script')
  exec('npm run docs')

  const repo = `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`,
    sourceType = GITHUB_REF?.split('/')[1] == 'heads' ? 'branch' : 'tag',
    refName = GITHUB_REF?.split('/').pop(),
    targetBranch = 'docs'

  info('Set up repo')
  exec(`git clone ${repo} out -b ${targetBranch}`)
  exec([
    'git pull',
    `git config user.name "${GITHUB_ACTOR}"`,
    `git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"`
  ], 'out')

  info('Commit docs build')
  exec([
    `cp ../docs/docs.json ${refName}.json`,
    'git add .',
    `git commit -m "Docs build for ${sourceType} ${refName}: ${GITHUB_SHA}"`,
  ], 'out')

  if (sourceType == 'tag' && validSemver(refName) && refName == getLastTag()) {
    info('Version update found, update latest')
    exec([
      'cp ../docs/docs.json latest.json',
      'git add .',
      `git commit -m "Update 'latest' for version ${refName}: ${GITHUB_SHA}"`,
    ], 'out')
  }

  info('Push changes to origin')
  exec(`git push origin ${targetBranch}`)
}
catch (e) {
  setFailed(e.stderr)
}

function exec(commands: string | string[], cd?: string) {
  const execCWD = cd && GITHUB_WORKSPACE ? path(GITHUB_WORKSPACE, cd) : GITHUB_WORKSPACE
  return typeof commands == 'string' ? [commands] : commands
    .map(cmd => {
      const res = execSync(cmd, { cwd: execCWD }).toString()
      info(res)
      return res
    })
}

function getLastTag(): string {
  const tags = execSync('git tag')
    .toString()
    .split('\n')
    .filter(validSemver)

  return semverSort(tags)[0]
}
