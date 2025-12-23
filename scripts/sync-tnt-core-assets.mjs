import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

const resolveTntCoreDir = () => {
  const envDir = process.env.TNT_CORE_DIR;
  if (envDir && existsSync(envDir)) return envDir;

  const candidates = [
    resolve(repoRoot, '../tnt-core'),
    resolve(repoRoot, '../../tnt-core'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error('TNT_CORE_DIR not found. Set TNT_CORE_DIR to your tnt-core repo.');
};

const writeAbiTs = (sourcePath, targetPath) => {
  const raw = readFileSync(sourcePath, 'utf-8');
  const parsed = JSON.parse(raw);
  const abi = parsed.abi ?? parsed;

  mkdirSync(dirname(targetPath), { recursive: true });
  const content = [
    '// AUTO-GENERATED FROM tnt-core. DO NOT EDIT MANUALLY.',
    'const ABI = ' + JSON.stringify(abi, null, 2) + ' as const;',
    '',
    'export default ABI;',
    '',
  ].join('\n');
  writeFileSync(targetPath, content);
};

const syncAbis = (tntCoreDir) => {
  const abiDir = resolve(tntCoreDir, 'bindings/abi');
  const mappings = [
    { source: 'ITangle.json', target: 'libs/tangle-shared-ui/src/abi/tangle.ts' },
    { source: 'MultiAssetDelegation.json', target: 'libs/tangle-shared-ui/src/abi/multiAssetDelegation.ts' },
    { source: 'IOperatorStatusRegistry.json', target: 'libs/tangle-shared-ui/src/abi/operatorStatusRegistry.ts' },
    { source: 'IBlueprintServiceManager.json', target: 'libs/tangle-shared-ui/src/abi/blueprintServiceManager.ts' },
  ];

  for (const mapping of mappings) {
    const sourcePath = resolve(abiDir, mapping.source);
    const targetPath = resolve(repoRoot, mapping.target);
    if (!existsSync(sourcePath)) {
      console.warn(`[sync] Missing ABI: ${sourcePath}`);
      continue;
    }
    writeAbiTs(sourcePath, targetPath);
    console.log(`[sync] ABI -> ${mapping.target}`);
  }
};

const syncFixtures = (tntCoreDir) => {
  const fixturesDir = resolve(tntCoreDir, 'fixtures/fixtures');
  const targetDir = resolve(repoRoot, 'scripts/local-env/fixtures');
  const files = ['localtestnet-state.json', 'localtestnet-broadcast.json'];

  mkdirSync(targetDir, { recursive: true });
  for (const name of files) {
    const sourcePath = resolve(fixturesDir, name);
    const targetPath = resolve(targetDir, name);
    if (!existsSync(sourcePath)) {
      console.warn(`[sync] Missing fixture: ${sourcePath}`);
      continue;
    }
    copyFileSync(sourcePath, targetPath);
    console.log(`[sync] Fixture -> scripts/local-env/fixtures/${name}`);
  }
};

const main = () => {
  const tntCoreDir = resolveTntCoreDir();
  syncAbis(tntCoreDir);
  syncFixtures(tntCoreDir);
};

main();
