import { evmToAddress } from '@polkadot/util-crypto';
import { OperatorData } from '../../../types';
import { randEthereumAddress, randNumber, randUserName } from '@ngneat/falso';
import uniqWith from 'lodash/uniqWith';

const tokenNames = ['TNT', 'USDC', 'USDT', 'DAI', 'WBTC', 'WETH', 'WBTC'];

function randVaultToken() {
  return {
    name: tokenNames[randNumber({ min: 0, max: tokenNames.length - 1 })],
    symbol: tokenNames[randNumber({ min: 0, max: tokenNames.length - 1 })],
    amount: randNumber({ min: 100, max: 10_000 }),
  };
}

export default function randOperator() {
  return {
    address: evmToAddress(randEthereumAddress()),
    identityName: randUserName(),
    restakersCount: randNumber({ max: 50 }),
    concentrationPercentage: randNumber({ max: 100 }),
    tvlInUsd: randNumber({ min: 100, max: 10_000 }),
    vaultTokens: uniqWith(
      Array.from({ length: randNumber({ max: 5 }) }).map(randVaultToken),
      (a, b) => a.name === b.name && a.symbol === b.symbol,
    ),
  } satisfies OperatorData;
}
