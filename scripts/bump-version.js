#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
const path = require('path');
const fs = require('fs');
const argv = require('yargs')
  .options({
    'skip-beta': {
      description: 'Do not increment as beta',
      type: 'boolean'
    }
  })
  .strict()
  .argv;

const cp = require('child_process');

const repo = `https://${process.env.GH_PAT}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

console.log('$ webb bump version', process.argv.slice(2).join(' '));

function gitSetup () {
  cp.execSync('git config push.default simple');
  cp.execSync('git config merge.ours.driver true');
  cp.execSync('git config user.name "Github Actions"');
  cp.execSync('git config user.email "action@github.com"');
  cp.execSync('git checkout master');
}

function npmGetVersion () {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
  ).version;
}

function gitBump () {
  const currentVersion = npmGetVersion();
  const [version, tag] = currentVersion.split('-');
  const [,, patch] = version.split('.');

  console.log(currentVersion, version, tag);
  if (tag) {
    // if we have a beta version, just continue the stream of betas
    cp.execSync('yarn polkadot-dev-version --type pre');
  } else if (argv['skip-beta']) {
    // don't allow beta versions
    cp.execSync('yarn polkadot-dev-version --type patch');
  } else if (patch === '0') {
    // patch is .0, so publish this as an actual release (surely we did our job on beta)
    cp.execSync('yarn polkadot-dev-version --type patch');
  } else if (patch === '1') {
    // continue with first new minor as beta
    cp.execSync('yarn polkadot-dev-version --type pre');
  } else {
    // manual setting of version, make some changes so we can commit
    fs.appendFileSync(path.join(process.cwd(), '.123trigger'), currentVersion);
  }

  cp.execSync('git add --all .');
}

function gitPush () {
  const version = npmGetVersion();
  let doGHRelease = false;

  if (process.env.GH_RELEASE_GITHUB_API_TOKEN) {
    const changes = fs.readFileSync('CHANGELOG.md', 'utf8');

    if (changes.includes(`## ${version}`)) {
      doGHRelease = true;
    } else if (version.endsWith('.1')) {
      throw new Error(`Unable to release, no CHANGELOG entry for ${version}`);
    }
  }

  cp.execSync('git add --all .');

  if (fs.existsSync('docs/README.md')) {
    cp.execSync('git add --all -f docs');
  }

  // add the skip checks for GitHub ...
  cp.execSync(`git commit --no-status --quiet -m "[CI Skip] release/${version.includes('-') ? 'beta' : 'stable'} ${version}
skip-checks: true"`);

cp.execSync(`git push ${repo} HEAD:${process.env.GITHUB_REF}`, true);

  if (doGHRelease) {
    const files = process.env.GH_RELEASE_FILES
      ? `--assets ${process.env.GH_RELEASE_FILES}`
      : '';

      cp.execSync(`yarn polkadot-exec-ghrelease --draft ${files} --yes`);
  }
}

gitSetup();
gitBump();
gitPush();