import {
  getDateFromEpoch,
  getWrappingFeesPercentageByFungibleToken,
} from '../utils';
import { VANCHORS_MAP } from '../constants';
import {
  WrappingFeesByChainType,
  AddressWithExplorerUrlsType,
} from '../components/PoolMetadataTable/types';

type PoolMetadataDataType = {
  name: string;
  symbol: string;
  signatureBridge: AddressWithExplorerUrlsType;
  vAnchor: AddressWithExplorerUrlsType;
  fungibleToken: AddressWithExplorerUrlsType;
  treasuryAddress: AddressWithExplorerUrlsType;
  wrappingFees: WrappingFeesByChainType;
  creationDate: string;
};

export default async function getPoolMetadataData(
  poolAddress: string
): Promise<PoolMetadataDataType> {
  const vanchor = VANCHORS_MAP[poolAddress];
  const creationDate = getDateFromEpoch(vanchor.creationTimestamp);

  const supportedChains = vanchor.supportedChains;

  // TODO: Replace this with the real explorer URLs
  const explorerUrls = supportedChains.reduce((map, typedChainId) => {
    return {
      ...map,
      [typedChainId]: '#',
    };
  }, {});

  const wrappingFees: WrappingFeesByChainType = {};
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
    signatureBridge: { address: vanchor.signatureBridge, urls: explorerUrls },
    vAnchor: { address: poolAddress, urls: explorerUrls },
    fungibleToken: {
      address: vanchor.fungibleTokenAddress,
      urls: explorerUrls,
    },
    treasuryAddress: {
      address: vanchor.treasuryAddress,
      urls: explorerUrls,
    },
    wrappingFees,
    creationDate: new Date(creationDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}
