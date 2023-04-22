import { ApiPromise } from '@polkadot/api';
import chalk from 'chalk';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { Option, U32 } from '@polkadot/types';
import { LoggerService } from '@webb-tools/browser-utils/src/logger/logger-service';
import { createApiPromise, polkadotTx } from '@webb-tools/test-utils';
import { BN } from 'bn.js';
import { Command } from 'commander';
import { resolve } from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const shell = require('shelljs');

const ALICE_PORT = 9944;
const BOB_PORT = 9945;

const TANGLE_SUDO_URI = '//TangleStandaloneSudo';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'WEBB';

const FUNGIBLE_ASSET = 'WEBB^2';

const localStandaloneTangleScript = resolve(
  workspaceRoot,
  '../tangle/scripts/run-standalone-local.sh'
);

// Define CLI options
const program = new Command();

program.option('-v --verbose', 'Enable node logging');

program.parse(process.argv);

const options = program.opts();

const logger = LoggerService.get('LOCAL TANGLE');

async function main() {
  // Start the nodes
  logger.info('Starting local tangle network');

  const proc = shell.exec(localStandaloneTangleScript + ' --clean', {
    cwd: resolve(localStandaloneTangleScript, '../../'),
    async: true,
    silent: true,
  });
  cleanup(() => proc.kill('SIGINT'));

  if (options.verbose) {
    logger.debug('Verbose mode enabled');
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    proc.stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });
  }

  // Wait until we are ready and connected
  logger.info('Waiting for APIs to be ready');

  const aliceApi = await createApiPromise(getEndpoint(ALICE_PORT));
  await aliceApi.isReady;

  const bobApi = await createApiPromise(getEndpoint(BOB_PORT));
  await bobApi.isReady;

  logger.info('APIs are ready');

  // Wait until the first block is produced
  logger.info('Waiting for first block to be produced');

  await aliceApi.rpc.chain.subscribeNewHeads(async (header) => {
    const block = header.number.toNumber();
    logger.debug(`New block produced: ${chalk.green(block.toString())}`);
    // Init pool share after first block
    if (block === 1) {
      await initPoolShare(aliceApi);
    }
  });
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring();

  // Create pool share asset
  logger.info('Creating pool share asset');
  const poolShareAssetId = await createPoolShare(api, FUNGIBLE_ASSET, sudoKey);
  logger.info(
    `Pool share asset ${FUNGIBLE_ASSET} created with id ${poolShareAssetId}`
  );

  // Add assets to pool
  logger.info('Adding assets to pool');
  await addAssetToPool(
    api,
    NATIVE_ASSET_ID,
    poolShareAssetId.toString(),
    sudoKey
  );
  logger.info(`Assets ${FUNGIBLE_ASSET} added to pool`);

  // Add assets metadata
  logger.info('Adding assets metadata');
  await addAssetMetadata(api, sudoKey, NATIVE_ASSET_ID, NATIVE_ASSET);
  await addAssetMetadata(
    api,
    sudoKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  logger.info(`Assets metadata added`);

  const vanchorId = await createVAnchor(api, poolShareAssetId, sudoKey);

  logger.info(`VAnchor with id \`${vanchorId}\` created`);

  logger.info('Tangle network ready to use');
}

function getEndpoint(port: number) {
  return `ws://127.0.0.1:${port}`;
}

function getKeyring() {
  const k = new Keyring({ type: 'sr25519' });
  const sudoKey = k.addFromUri(TANGLE_SUDO_URI);
  return sudoKey;
}

function cleanup(callback: () => any) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function noOp() {}

  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;

  // do app specific cleaning before exiting
  process.on('exit', function () {
    callback();
    process.exit(0);
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function () {
    callback();
    process.exit(0);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function (e) {
    callback();
    process.exit(1);
  });
}

async function createPoolShare(
  apiPromise: ApiPromise,
  name: string,
  signer: KeyringPair,
  existentialDeposit = 0
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [
      apiPromise.tx.assetRegistry.register(
        name,
        {
          PoolShare: [+NATIVE_ASSET_ID],
        },
        existentialDeposit
      ),
    ],
    signer
  );
  const nextAssetId = await apiPromise.query.assetRegistry.nextAssetId<U32>();
  const id = nextAssetId.toNumber() - 1;
  const tokenWrapperNonce = await apiPromise.query.tokenWrapper.proposalNonce<
    Option<U32>
  >(name);
  const nonce = tokenWrapperNonce.unwrapOr(new BN(0)).toNumber() + 1;
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.tokenWrapper.setWrappingFee(1, id, nonce)],
    signer
  );
  return id;
}

async function addAssetToPool(
  apiPromise: ApiPromise,
  assetId: string,
  poolAssetId: string,
  signer: KeyringPair
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.assetRegistry.addAssetToPool(poolAssetId, Number(assetId))],
    signer
  );
}

async function addAssetMetadata(
  apiPromise: ApiPromise,
  signer: KeyringPair,
  assetId: string,
  assetSymbol: string,
  decimals = 18
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.assetRegistry.setMetadata(assetId, assetSymbol, decimals)],
    signer
  );
}

async function createVAnchor(
  apiPromise: ApiPromise,
  assetId: number,
  signer: KeyringPair
): Promise<number> {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.vAnchorBn254.create(1, 30, assetId)],
    signer
  );
  const nextTreeId = await apiPromise?.query.merkleTreeBn254.nextTreeId();
  return nextTreeId.toNumber() - 1;
}

main().catch(console.error);
