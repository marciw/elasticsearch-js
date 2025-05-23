/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

/**
 * Script for releasing the canary client to npm.
 * It should be executed from the top level directory of the repository.
 *
 * Usage:
 *    node scripts/release-canary.js --otp <otp-code>
 *
 * You can reset the canary count via the `--reset` option
 *    node scripts/release-canary.js --otp <otp-code> --reset
 *
 * You can also do a dry run with the `--dry-run` option
 *    node scripts/release-canary.js --otp <otp-code> --dry-run
 */

const readline = require('readline')
const assert = require('assert')
const { execSync } = require('child_process')
const { writeFile, readFile } = require('fs').promises
const { join } = require('path')
const minimist = require('minimist')
const chalk = require('chalk')

const helpMessage = `usage: node scripts/release-canary.js [options]

    --otp <code> One-time password (required)
    --reset      Reset the canary version to 1
    --dry-run    Run everything but don't actually publish
    -h, --help   Show this help message`

async function release (opts) {
  if (opts.help) {
    console.log(helpMessage)
    process.exit(0)
  }

  assert(process.cwd() !== __dirname, 'You should run the script from the top level directory of the repository')
  if (!opts['dry-run']) {
    assert(typeof opts.otp === 'string', 'Missing OTP')
  }

  const packageJson = JSON.parse(await readFile(join(__dirname, '..', 'package.json'), 'utf8'))
  const originalName = packageJson.name
  const originalVersion = packageJson.version
  const currentCanaryVersion = packageJson.versionCanary
  const originalTypes = packageJson.types

  const newCanaryInteger = opts.reset ? 1 : (Number(currentCanaryVersion.split('-')[1].split('.')[1]) + 1)
  const newCanaryVersion = `${originalVersion.split('-')[0]}-canary.${newCanaryInteger}`

  // Update the package.json with the correct name and new version
  packageJson.name = '@elastic/elasticsearch-canary'
  packageJson.version = newCanaryVersion
  packageJson.versionCanary = newCanaryVersion
  packageJson.commitHash = execSync('git log -1 --pretty=format:%h').toString()

  // update the package.json
  await writeFile(
    join(__dirname, '..', 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  )

  // confirm the package.json changes with the user
  const diff = execSync('git diff').toString().split('\n').map(colorDiff).join('\n')
  console.log(diff)
  const answer = await confirm()

  // release on npm with provided otp
  if (answer) {
    execSync(`npm publish --otp ${opts.otp} ${opts['dry-run'] ? '--dry-run' : ''}`, { stdio: 'inherit' })
  } else {
    // the changes were not good, restore the previous canary version
    packageJson.versionCanary = currentCanaryVersion
  }

  // restore the package.json to the original values
  packageJson.name = originalName
  packageJson.version = originalVersion
  packageJson.types = originalTypes
  delete packageJson.commitHash

  await writeFile(
    join(__dirname, '..', 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  )
}

function confirm () {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Does it look good? (y/n) ', (answer) => {
      resolve(answer === 'y')
      rl.close()
    })
  })
}

function colorDiff (line) {
  if (line.startsWith('+')) {
    return chalk.green(line)
  } else if (line.startsWith('-')) {
    return chalk.red(line)
  } else {
    return line
  }
}

release(
  minimist(process.argv.slice(2), {
    unknown (option) {
      console.log(`Unrecognized option: ${option}`)
      process.exit(1)
    },
    string: [
      // The otp code for publishing the package
      'otp'
    ],
    boolean: [
      // Reset the canary version to '1'
      'reset',

      // run all the steps but don't publish
      'dry-run',

      // help text
      'help'
    ],
    alias: { help: 'h' }
  })
)
  .catch(err => {
    console.log(err)
    console.log('\n' + helpMessage)
    process.exit(1)
  })
