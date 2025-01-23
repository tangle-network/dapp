import { evmToAddress } from '@polkadot/util-crypto';
import { RestakeOperator } from '../../../types';
import { randEthereumAddress, randNumber, randUserName } from '@ngneat/falso';
import uniqWith from 'lodash/uniqWith';
import { assertSubstrateAddress } from '@webb-tools/webb-ui-components';

const TOKEN_NAMES = ['TNT', 'USDC', 'USDT', 'DAI', 'WBTC', 'WETH', 'WBTC'];

const randVaultToken = () => {
  return {
    name: TOKEN_NAMES[randNumber({ min: 0, max: TOKEN_NAMES.length - 1 })],
    symbol: TOKEN_NAMES[randNumber({ min: 0, max: TOKEN_NAMES.length - 1 })],
    amount: randNumber({ min: 100, max: 10_000 }),
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
  } satisfies RestakeOperator;
};

export default randOperator;
