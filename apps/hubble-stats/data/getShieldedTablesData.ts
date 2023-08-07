import { rand, randEthereumAddress, randNumber } from '@ngneat/falso';
import { arrayFrom } from '@webb-tools/webb-ui-components/utils';

import { ShieldedAssetType } from '../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../components/ShieldedPoolsTable/types';

type ShieldedTablesDataType = {
  assetsData: ShieldedAssetType[];
  poolsData: ShieldedPoolType[];
};

const typedChainIds = [
  1099511627781, 1099511628196, 1099511629063, 1099511670889, 1099511707777,
  1099512049389, 1099512162129, 1099522782887,
];

const tokens = [
  'dai',
  'eth',
  'usdc',
  'usdt',
  'moondev',
  'matic',
  'weth',
  'op',
  'arbitrum',
];

const getNewAsset = (): ShieldedAssetType => {
  return {
    address: randEthereumAddress(),
    symbol: 'webbParachain',
    url: '#',
    poolType: rand(['single', 'multi']),
    composition: [
      ...new Set(
        rand(tokens, {
          length: randNumber({ min: 2, max: 4 }),
        })
      ),
    ],
    deposits24h: randNumber({ min: 1000, max: 9999 }),
    tvl: randNumber({ min: 1_000_000, max: 50_000_000 }),
    typedChainIds: [
      ...new Set(
        rand(typedChainIds, {
          length: randNumber({ min: 2, max: typedChainIds.length }),
        })
      ),
    ],
  };
};

const getNewPool = (): ShieldedPoolType => {
  return {
    address: randEthereumAddress(),
    symbol: 'MASP-1',
    poolType: rand(['single', 'multi']),
    token: randNumber({ min: 1, max: 4 }),
    deposits24h: randNumber({ min: 1000, max: 9999 }),
    tvl: randNumber({ min: 1_000_000, max: 50_000_000 }),
    typedChainIds: [
      ...new Set(
        rand(typedChainIds, {
          length: randNumber({ min: 2, max: typedChainIds.length }),
        })
      ),
    ],
  };
};

export default async function getShieldedTablesData(): Promise<ShieldedTablesDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  const assetsData = arrayFrom(8, () => getNewAsset());
  const poolsData = arrayFrom(8, () => getNewPool());
  return { assetsData, poolsData };
}
