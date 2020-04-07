import { setFailed } from '@actions/core'
import { which } from '@actions/io'
import { exec } from '@actions/exec'
import { execSync } from 'child_process'
import { valid as validSemver } from 'semver'
import { desc as semverSort } from 'semver-sort'
import { resolve } from 'path'

const {
  GITHUB_ACTOR,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
  HOME,
} = process.env;

(async () => {
  try {
    const options = {
      cwd: resolve(__dirname, '..'),
      env: {
        HOME: HOME || '',
        refName: GITHUB_REF?.split('/').pop() || '',
        repo: `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`,
        sourceType: GITHUB_REF?.split('/')[1] == 'heads' ? 'branch' : 'tag',
        targetBranch: 'docs',
        updateLatest: 'no'
      }
    }

    const { env: { refName, sourceType } } = options
    if (sourceType == 'tag' && validSemver(refName) && refName == getLastTag())
      options.env.updateLatest = 'yes'

    await exec(await which('bash', true), ['src/deploy.sh'], options)
  }
  catch (e) {
    const error =
      e instanceof Buffer ? e.toString() :
        e.stderr ||
          e instanceof Error ? e.message :
          typeof e == 'object' ? JSON.stringify(e) :
            e
    console.error(e)
    setFailed(error)
  }
})()

function getLastTag(): string {
  const tags = execSync('git tag')
    .toString()
    .split('\n')
    .filter(validSemver)

  return semverSort(tags)[0]
}
