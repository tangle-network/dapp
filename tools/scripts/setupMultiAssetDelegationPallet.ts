import chalk from 'chalk';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import {
  TANGLE_LOCAL_WS_RPC_ENDPOINT,
  TANGLE_TOKEN_DECIMALS,
} from '@webb-tools/dapp-config/constants/tangle';
import { parseUnits } from 'viem';
import { formatBalance, stringToU8a } from '@polkadot/util';
import { encodeAddress, evmToAddress } from '@polkadot/util-crypto';
import yargs from 'yargs/yargs';
import { SubmittableExtrinsic } from '@polkadot/api/types';

function info(message: string): void {
  console.log(chalk.cyan(`ℹ️ ${message}`));
}

function success(message: string): void {
  console.log(chalk.green(`✅ ${message}\n`));
}

/**
 * Retrieving by "Module ID" to Address function from
 */

// This is hardcoded on the runtime
const PALLET_ID = 'PotStake';

/**
 * @see https://substrate.stackexchange.com/a/2214
 */
const PALLET_ACCOUNT = encodeAddress(
  stringToU8a(('modl' + PALLET_ID).padEnd(32, '\0')),
);

const MINIMUM_BALANCE_UINT = '1';
const MINT_AMOUNT = '1000';
const POOL_ID = 1;
const APY = 12;
const CAP = parseUnits('2000', TANGLE_TOKEN_DECIMALS);

const argv = yargs(process.argv.slice(2))
  .options({
    evmAccount: {
      type: 'string',
      desc: 'The EVM account that will be funded with pallet assets',
      requiresArg: false,
    },
  })
  .parseSync();

// Initialize the API
info('Connecting to the local Tangle network...');
const provider = new WsProvider(TANGLE_LOCAL_WS_RPC_ENDPOINT);
const api = await ApiPromise.create({ provider, noInitWarn: true });
success('Connected to the local Tangle network!');

// Fetching the chain metadata
info('Fetching chain metadata...');

const chain = await api.rpc.system.chain();
const decimals =
  api.registry.chainDecimals.length > 0 ? api.registry.chainDecimals[0] : 18;
const ss58Format =
  typeof api.registry.chainSS58 === 'number' ? api.registry.chainSS58 : 42;
const tokenSymbol = (api.registry.chainTokens ||
  formatBalance.getDefaults().unit)[0];

success(
  `Chain metadata: ${JSON.stringify({ chain, decimals, ss58Format, tokenSymbol }, null, 2)}`,
);

// Initialize the accounts
const keyring = new Keyring({ type: 'sr25519' });
const ALICE_SUDO = keyring.addFromUri('//Alice');
const BOB = keyring.addFromUri('//Bob');
const DAVE = keyring.addFromUri('//Dave');

type Asset = {
  id: number;
  symbol: string;
  decimals: number;
};

const tgTEST = {
  id: 1,
  symbol: 'tgTEST',
  decimals: 18,
} as const satisfies Asset;

const tgtTNT = {
  id: 2,
  symbol: 'tgtTNT',
  decimals: 18,
} as const satisfies Asset;

async function batchTxes(txes: Parameters<typeof api.tx.utility.batch>[0]) {
  const nonce = await api.rpc.system.accountNextIndex(ALICE_SUDO.address);
  return api.tx.utility.batchAll(txes).signAndSend(ALICE_SUDO, { nonce });
}

info('Creating two assets...');
await batchTxes([
  api.tx.assets.create(
    tgTEST.id,
    ALICE_SUDO.address,
    parseUnits(MINIMUM_BALANCE_UINT, tgTEST.decimals),
  ),
  api.tx.assets.create(
    tgtTNT.id,
    ALICE_SUDO.address,
    parseUnits(MINIMUM_BALANCE_UINT, tgtTNT.decimals),
  ),
]);

info('Adding asset metadata...');
await batchTxes([
  api.tx.assets.setMetadata(
    tgTEST.id,
    tgTEST.symbol,
    tgTEST.symbol,
    tgTEST.decimals,
  ),
  api.tx.assets.setMetadata(
    tgtTNT.id,
    tgtTNT.symbol,
    tgtTNT.symbol,
    tgtTNT.decimals,
  ),
]);

info('Minting asests to Alice and Bob...');
await batchTxes([
  api.tx.assets.mint(
    tgTEST.id,
    ALICE_SUDO.address,
    parseUnits(MINT_AMOUNT, tgTEST.decimals),
  ),
  api.tx.assets.mint(
    tgtTNT.id,
    ALICE_SUDO.address,
    parseUnits(MINT_AMOUNT, tgtTNT.decimals),
  ),
  api.tx.assets.mint(
    tgTEST.id,
    BOB.address,
    parseUnits(MINT_AMOUNT, tgTEST.decimals),
  ),
  api.tx.assets.mint(
    tgtTNT.id,
    BOB.address,
    parseUnits(MINT_AMOUNT, tgtTNT.decimals),
  ),
]);
success('Assets created and minted successfully!');

if (argv.evmAccount) {
  const evmToSubstrateAddress = evmToAddress(argv.evmAccount);
  info(
    `Received evm account: ${argv.evmAccount}\nConverted to substrate address: ${evmToSubstrateAddress}\nMint fund to the account...`,
  );

  await batchTxes([
    api.tx.balances.transferKeepAlive(
      evmToSubstrateAddress,
      parseUnits(MINIMUM_BALANCE_UINT, decimals),
    ),
    api.tx.assets.mint(
      tgTEST.id,
      evmToSubstrateAddress,
      parseUnits(MINT_AMOUNT, tgTEST.decimals),
    ),
    api.tx.assets.mint(
      tgtTNT.id,
      evmToSubstrateAddress,
      parseUnits(MINT_AMOUNT, tgtTNT.decimals),
    ),
  ]);

  success('Minted fund to the EVM account successfully!');
}

info('Transfer native token to multi-asset-delegation pallet...');
let nonce = await api.rpc.system.accountNextIndex(ALICE_SUDO.address);
await api.tx.balances
  .transferKeepAlive(PALLET_ACCOUNT, parseUnits('1', decimals))
  .signAndSend(ALICE_SUDO, { nonce });
success('Native token transferred to multi-asset-delegation pallet!');

info('Create and set reward for pool...');
await batchTxes([
  api.tx.multiAssetDelegation.manageAssetInPool(POOL_ID, tgTEST.id, 'Add'),
  api.tx.multiAssetDelegation.manageAssetInPool(POOL_ID, tgtTNT.id, 'Add'),
  api.tx.sudo.sudo(
    api.tx.multiAssetDelegation.setIncentiveApyAndCap(POOL_ID, APY, CAP),
  ),
]);
success('Pool created!');

info('Join operators for DAVE');
nonce = await api.rpc.system.accountNextIndex(DAVE.address);
await api.tx.multiAssetDelegation
  .joinOperators(parseUnits(MINIMUM_BALANCE_UINT, TANGLE_TOKEN_DECIMALS))
  .signAndSend(DAVE, { nonce });
success('DAVE joined the operators successfully!');

console.log(
  chalk.bold.green(
    '✨ Pallet `multi-asset-delegation` setup completed successfully! ✨',
  ),
);

process.exit(0);
