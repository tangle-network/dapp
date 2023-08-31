import { randNumber } from '@ngneat/falso';

import {
  getDateFromEpoch,
  getWrappingFeesPercentageByFungibleToken,
} from '../utils';
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
  const creationDate = getDateFromEpoch(vanchor.creationTimestamp);

  const wrappingFees: Record<number, number | undefined> = {};
  const supportedChains = vanchor.supportedChains;
  for (const typedChainId of supportedChains) {
    let feesPercentage: number | undefined;
    try {
      feesPercentage = await getWrappingFeesPercentageByFungibleToken(
        vanchor.fungibleTokenAddress,
        typedChainId
      );
    } catch {
      feesPercentage = undefined;
    }
    wrappingFees[typedChainId] = feesPercentage;
  }

  return {
    name: vanchor.fungibleTokenName,
    symbol: vanchor.fungibleTokenSymbol,
    signatureBridge: vanchor.signatureBridge,
    vAnchor: poolAddress,
    fungibleToken: vanchor.fungibleTokenAddress,
    treasuryAddress: vanchor.treasuryAddress,
    wrappingFees: randNumber({ min: 1, max: 99 }),
    creationDate: new Date(creationDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}
