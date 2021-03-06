import { which } from '@actions/io'
import { setFailed } from '@actions/core'
import { exec } from '@actions/exec'
import { execSync } from 'child_process'
import { join } from 'path'
import { valid as validSemver } from 'semver'
import { desc as semverSort } from 'semver-sort'

const {
  GITHUB_ACTOR,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
} = process.env;

(async () => {
  try {
    const options = {
      env: {
        ...process.env,
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

    await exec(await which('bash', true), [join(__dirname, '../src/deploy.sh')], options)
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
