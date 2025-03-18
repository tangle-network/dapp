// @ts-check

import { releaseChangelog, releaseVersion } from 'nx/release/index.js';
import yargs from 'yargs/yargs';

(async () => {
  const options = await yargs(process.argv.slice(2))
    .version(false) // don't use the default meaning of version in yargs
    .option('version', {
      description:
        'Explicit version specifier to use, if overriding conventional commits',
      type: 'string',
      default: 'patch',
    })
    .option('dryRun', {
      alias: 'd',
      description:
        'Whether or not to perform a dry-run of the release process, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('verbose', {
      alias: 'v',
      description:
        'Whether or not to enable verbose logging, defaults to false',
      type: 'boolean',
      default: false,
    })
    .option('stageChanges', {
      description: 'Whether or not to stage changes in git, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('gitCommit', {
      description: 'Whether or not to create a commit in git, defaults to true',
      type: 'boolean',
      default: true,
    })
    .option('gitTag', {
      description: 'Whether or not to create a tag in git, defaults to false',
      type: 'boolean',
      default: false,
    })
    .option('projects', {
      description: 'Projects to release, defaults to all',
      type: 'string',
      array: true,
      default: [],
    })
    .option('firstRelease', {
      alias: 'first-release',
      description:
        'Whether or not to perform a first release, defaults to false',
      type: 'boolean',
      default: false,
    })
    .parseAsync();

  const projectList =
    Array.isArray(options.projects) && options.projects.length > 0
      ? { projects: options.projects }
      : {};

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    specifier: options.version,
    dryRun: options.dryRun,
    verbose: options.verbose,
    stageChanges: options.stageChanges,
    // we don't want to commit the version changes only,
    // we want to commit the changelog changes as well
    gitCommit: false,
    gitTag: false,
    firstRelease: options.firstRelease,
    ...projectList,
  });

  await releaseChangelog({
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun: options.dryRun,
    verbose: options.verbose,
    stageChanges: options.stageChanges,
    gitCommit: options.gitCommit,
    gitTag: options.gitTag,
    firstRelease: options.firstRelease,
    ...projectList,
  });

  process.exit(0);
})();
