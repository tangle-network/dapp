// @ts-check

import { releasePublish } from 'nx/release/index.js';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

(async () => {
  const options = await yargs(hideBin(process.argv))
    .version(false) // don't use the default meaning of version in yargs
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
    .option('projects', {
      description: 'Projects to publish, defaults to all',
      type: 'string',
      array: true,
      demandOption: true,
    })
    .parseAsync();

  await releasePublish({
    verbose: options.verbose,
    dryRun: options.dryRun,
    projects: options.projects,
  });

  process.exit(0);
})();
