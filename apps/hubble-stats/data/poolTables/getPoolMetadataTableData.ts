import {
  getDateFromEpoch,
  getWrappingFeesPercentageByFungibleToken,
  getExplorerUrlByAddressByChains,
} from '../../utils';
import { VANCHORS_MAP } from '../../constants';
import {
  WrappingFeesByChainType,
  AddressWithExplorerUrlsType,
} from '../../components/PoolMetadataTable/types';

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

export default async function getPoolMetadataTableData(
  poolAddress: string,
): Promise<PoolMetadataDataType> {
  const vAnchor = VANCHORS_MAP[poolAddress];
  const {
    creationTimestamp,
    supportedChains,
    fungibleTokenName,
    fungibleTokenSymbol,
    fungibleTokenAddress,
    signatureBridge,
    treasuryAddress,
  } = vAnchor;
  const creationDate = getDateFromEpoch(creationTimestamp);

  const wrappingFees: WrappingFeesByChainType = {};
  for (const typedChainId of supportedChains) {
    let feesPercentage: number | undefined;
    try {
      feesPercentage = await getWrappingFeesPercentageByFungibleToken(
        fungibleTokenAddress,
        typedChainId,
      );
    } catch {
      feesPercentage = undefined;
    }
    wrappingFees[typedChainId] = feesPercentage;
  }

  return {
    name: fungibleTokenName,
    symbol: fungibleTokenSymbol,
    signatureBridge: {
      address: signatureBridge,
      urls: getExplorerUrlByAddressByChains(signatureBridge, supportedChains),
    },
    vAnchor: {
      address: poolAddress,
      urls: getExplorerUrlByAddressByChains(poolAddress, supportedChains),
    },
    fungibleToken: {
      address: fungibleTokenAddress,
      urls: getExplorerUrlByAddressByChains(
        fungibleTokenAddress,
        supportedChains,
      ),
    },
    treasuryAddress: {
      address: treasuryAddress,
      urls: getExplorerUrlByAddressByChains(treasuryAddress, supportedChains),
    },
    wrappingFees,
    creationDate: new Date(creationDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}
