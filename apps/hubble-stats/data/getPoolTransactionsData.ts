import { rand, randEthereumAddress, randFloat } from '@ngneat/falso';
import { arrayFrom } from '@webb-tools/webb-ui-components/utils';

import { PoolTransactionType } from '../components/PoolTransactionsTable/types';

const typedChainIds = [
  1099511627781, 1099511628196, 1099511629063, 1099511670889, 1099511707777,
  1099512049389, 1099512162129, 1099522782887,
];

type PoolTransactionDataType = {
  transactions: PoolTransactionType[];
};

const getNewTx = (): PoolTransactionType => {
  return {
    txHash: randEthereumAddress(),
    activity: rand(['deposit', 'transfer', 'withdraw']),
    tokenAmount: randFloat({ min: 0, max: 20, fraction: 2 }),
    tokenSymbol: rand(['ETH', 'WETH', 'webbPRC']),
    sourceTypedChainId: rand(typedChainIds),
    destinationTypedChainId: undefined,
    time: 'Today',
  };
};

export default async function getPoolTransactionsData(
  poolAddress: string
): Promise<PoolTransactionDataType> {
  return {
    transactions: arrayFrom(15, () => getNewTx()),
  };
}
