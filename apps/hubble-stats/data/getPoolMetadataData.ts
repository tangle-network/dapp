import { randNumber, randEthereumAddress } from '@ngneat/falso';
import fetchAnchorMetadata from '@webb-tools/web3-api-provider/src/fetchAnchorMetadata';

import { VANCHORS_MAP } from '../constants';

type PoolMetadataDataType = {
  name: string;
  symbol: string;
  signatureBridge: string;
  vAnchor: string;
  fungibleToken: string;
  treasuryAddress: string;
  wrappingFees: number;
  creationDate: string;
};

export default async function getPoolMetadataData(
  poolAddress: string
): Promise<PoolMetadataDataType> {
  const vanchor = VANCHORS_MAP[poolAddress];

  return {
    name: vanchor.fungibleTokenName,
    symbol: vanchor.fungibleTokenSymbol,
    signatureBridge: randEthereumAddress(),
    vAnchor: poolAddress,
    fungibleToken: vanchor.fungibleTokenAddress,
    treasuryAddress: randEthereumAddress(),
    wrappingFees: randNumber({ min: 1, max: 99 }),
    creationDate: '13 August 2023',
  };
}
