import { ApiPromise } from '@polkadot/api';
import Keyring from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { Option, U32 } from '@polkadot/types';
import { LoggerService } from '@webb-tools/browser-utils/src/logger/logger-service';
import { LocalProtocolSubstrate, polkadotTx } from '@webb-tools/test-utils';
import { BN } from 'bn.js';
import { Command } from 'commander';
import { resolve } from 'path';

// Define CLI options
const program = new Command();

program.option('-v --verbose', 'Enable node logging');

program.parse(process.argv);

const options = program.opts();

const BOB_PHRASE =
  'asthma early danger glue satisfy spatial decade wing organ bean census announce';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'WEBB';

const FUNGIBLE_ASSET = 'WEBB^2';

const usageMode = {
  mode: 'host',
  nodePath: resolve(
    '../protocol-substrate/target/release/webb-standalone-node'
  ),
} as const;

const logger = LoggerService.get('LOCAL SUBSTRATE');

async function main() {
  // Start the nodes
  logger.info('Starting nodes');

  const aliceNode = await LocalProtocolSubstrate.start({
    name: 'substrate-alice',
    authority: 'alice',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  const bobNode = await LocalProtocolSubstrate.start({
    name: 'substrate-bob',
    authority: 'alice',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  logger.info('Nodes started');

  // Wait until we are ready and connected
  logger.info('Waiting for APIs to be ready');

  const aliceApi = await aliceNode.api();
  await aliceApi.isReady;

  const bobApi = await bobNode.api();
  await bobApi.isReady;

  logger.info('APIs are ready');

  // Transfer funds
  const { alice: aliceKey, bob: bobKey, charlie: charlieKey } = getKeyring();

  // Create pool share asset
  logger.info('Creating pool share asset');
  const poolShareAssetId = await createPoolShare(
    aliceApi,
    FUNGIBLE_ASSET,
    aliceKey
  );
  logger.info(
    `Pool share asset ${FUNGIBLE_ASSET} created with id ${poolShareAssetId}`
  );

  // Add assets to pool
  logger.info('Adding assets to pool');
  await addAssetToPool(
    aliceApi,
    NATIVE_ASSET_ID,
    poolShareAssetId.toString(),
    aliceKey
  );
  logger.info(`Assets ${FUNGIBLE_ASSET} added to pool`);

  // Add assets metadata
  logger.info('Adding assets metadata');
  await addAssetMetadata(aliceApi, aliceKey, NATIVE_ASSET_ID, NATIVE_ASSET);
  await addAssetMetadata(
    aliceApi,
    aliceKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  logger.info(`Assets metadata added`);

  logger.info('Protocol Substrate ready to use');
}

let keyring: {
  bob: KeyringPair;
  alice: KeyringPair;
  charlie: KeyringPair;
};

function getKeyring() {
  if (keyring) {
    return keyring;
  }
  const k = new Keyring({ type: 'sr25519' });
  const bob = k.addFromMnemonic(BOB_PHRASE);
  const alice = k.addFromUri('//Alice');
  const charlie = k.addFromUri('//Charlie');
  keyring = {
    bob,
    alice,
    charlie,
  };
  return keyring;
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

main().catch(console.error);
