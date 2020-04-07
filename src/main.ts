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
  HOME
} = process.env

console.log(HOME)

const options = {
  env: {
    refName: GITHUB_REF?.split('/').pop() || '',
    repo: `https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`,
    sourceType: GITHUB_REF?.split('/')[1] == 'heads' ? 'branch' : 'tag',
    targetBranch: 'docs',
    HOME
  }
};

(async () => {
  try {
    await runFile('setup')
    await runFile('tagged')

    const { env: { refName, sourceType } } = options
    if (sourceType == 'tag' && validSemver(refName) && refName == getLastTag())
      await runFile('latest')

    await runFile('post')
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


async function runFile(name: string) {
  return exec(await which('bash', true), [`src/${name}.sh`], {
    ...options,
    cwd: resolve(__dirname, '..')
  })
}

function getLastTag(): string {
  const tags = execSync('git tag')
    .toString()
    .split('\n')
    .filter(validSemver)

  return semverSort(tags)[0]
}
