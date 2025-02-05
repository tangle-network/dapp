import {
  randChanceBoolean,
  randEthereumAddress,
  randFloat,
  randNumber,
  randUserName,
} from '@ngneat/falso';
import { evmToAddress } from '@polkadot/util-crypto';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { assertSubstrateAddress } from '@webb-tools/webb-ui-components';
import { Decimal } from 'decimal.js';
import uniqWith from 'lodash/uniqWith';
import { RestakeOperator } from '../../../types';

const TOKEN_NAMES = ['TNT', 'USDC', 'USDT', 'DAI', 'WBTC', 'WETH', 'WBTC'];

const randVaultToken = () => {
  return {
    name: TOKEN_NAMES[randNumber({ min: 0, max: TOKEN_NAMES.length - 1 })],
    symbol: TOKEN_NAMES[randNumber({ min: 0, max: TOKEN_NAMES.length - 1 })],
    amount: new Decimal(randFloat({ min: 100, max: 10_000 })),
  };
};

const randOperator = (): RestakeOperator => {
  return {
    address: assertSubstrateAddress(evmToAddress(randEthereumAddress())),
    identityName: randUserName(),
    restakersCount: randNumber({ max: 50 }),
    concentrationPercentage: randNumber({ max: 100 }),
    tvlInUsd: randNumber({ min: 100, max: 10_000 }),
    vaultTokens: uniqWith(
      Array.from({ length: randNumber({ max: 5 }) }).map(randVaultToken),
      (a, b) => a.name === b.name && a.symbol === b.symbol,
    ),
    selfBondedAmount:
      BigInt(randNumber({ min: 100, max: 10_000 })) *
      BigInt(10 ** TANGLE_TOKEN_DECIMALS),
    isDelegated: randChanceBoolean({ chanceFalse: 0.9 }),
  } satisfies RestakeOperator;
};

export default randOperator;
