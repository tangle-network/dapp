// @ts-check

import { releaseChangelog } from 'nx/src/command-line/release/changelog.js';
import { releaseVersion } from 'nx/src/command-line/release/version.js';
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
    .parseAsync();

  const { workspaceVersion, projectsVersionData } = await releaseVersion({
    specifier: options.version,
    dryRun: options.dryRun,
    verbose: options.verbose,
    stageChanges: options.stageChanges,
    gitCommit: options.gitCommit,
    gitTag: options.gitTag,
  });

  await releaseChangelog({
    versionData: projectsVersionData,
    version: workspaceVersion,
    dryRun: options.dryRun,
    verbose: options.verbose,
    stageChanges: options.stageChanges,
    gitCommit: options.gitCommit,
    gitTag: options.gitTag,
  });

  process.exit(0);
})();
