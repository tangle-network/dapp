import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const graphqlDir = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'libs',
  'tangle-shared-ui',
  'src',
  'graphql',
);

if (!fs.existsSync(graphqlDir)) {
  console.log('Running codegen...');
  // Run the codegen script in the root directory
  execSync('yarn codegen', {
    stdio: 'inherit',
    cwd: path.join(path.dirname(new URL(import.meta.url).pathname), '..'),
  });
} else {
  console.log('Codegen already exists, skipping...');
}
