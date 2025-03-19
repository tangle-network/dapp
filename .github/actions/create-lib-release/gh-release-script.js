// @ts-check

import core from '@actions/core';
import { request } from '@octokit/request';
import { readFileSync } from 'fs';
import { releasePublish } from 'nx/release/index.js';
import { resolve } from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

function gatherReleaseInfo(project, version) {
  const logPath = resolve(`./libs/${project}/CHANGELOG.md`);
  const changeLogs = readFileSync(logPath, 'utf8');
  const regex = /## ([0-9]+(\.[0-9]+)+)\s\([0-9]{4}-[0-9]{2}-[0-9]{2}\)/i;

  let lines = changeLogs.split(/\n/);
  let foundChangelog = false;
  let releaseInfo = '';
  let i = 0;

  for (let j = 0; j < lines.length; j++) {
    if (lines[j].includes(`${version}`)) {
      i = j;
      j = lines.length;
      foundChangelog = true;
    }
  }

  lines = lines.slice(i);

  if (foundChangelog) {
    for (let j = 0; j < lines.length; j++) {
      if (j === 0) {
        releaseInfo += `${lines[j]}` + '\n';
        continue;
      }

      if (!regex.test(lines[j])) {
        releaseInfo += `${lines[j]}` + '\n';
      } else {
        j = lines.length;
      }
    }
  }

  if (releaseInfo === '') {
    core.setFailed(
      'No release info found, either missing in changelog or changelog is formatted incorrectly',
    );
  }

  console.log(`Gathered release info for ${project}...`);
  return releaseInfo;
}

async function publishToGithub(releaseInfo, version, project, repo, owner) {
  await request('POST /repos/{owner}/{repo}/releases', {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
    owner,
    name: `[${version}] @${owner}/${project}`,
    repo,
    tag_name: `${project}/${version}`,
    body: releaseInfo,
  })
    .then(() => {
      console.log(`Published to Github: ${project}/${version}`);
    })
    .catch((err) => {
      core.setFailed(err);
      throw err;
    });
}

(async () => {
  const options = await yargs(hideBin(process.argv))
    .option('projects', {
      description: 'Projects to publish',
      type: 'string',
      array: true,
      demandOption: true,
    })
    .option('repo', {
      description: 'Repository name',
      type: 'string',
      demandOption: true,
    })
    .option('owner', {
      description: 'Repository owner',
      type: 'string',
      demandOption: true,
    })
    .parseAsync();

  for (const project of options.projects) {
    // Read the version from the package.json
    const packageJson = readFileSync(
      resolve(`./dist/libs/${project}/package.json`),
      'utf8',
    );
    const version = JSON.parse(packageJson).version;

    const releaseInfo = gatherReleaseInfo(project, version);

    await publishToGithub(
      releaseInfo,
      version,
      project,
      options.repo,
      options.owner,
    );
  }

  const publishResults = await releasePublish({
    projects: options.projects,
    outputStyle: 'static',
    firstRelease: true,
  });

  process.exit(
    Object.values(publishResults).every((result) => result.code === 0) ? 0 : 1,
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
