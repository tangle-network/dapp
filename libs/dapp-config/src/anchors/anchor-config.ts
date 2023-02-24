import { ApiConfig } from '..';
import {
  CurrencyId,
  EVMChainId,
  PresetTypedChainId,
} from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

// Anchor config is indexed by WebbCurrencyId
export const anchorsConfig: ApiConfig['anchors'] = {
  [CurrencyId.webbETH]: {
    [PresetTypedChainId.ArbitrumTestnet]:
      '0xa1a2b7e08793b3033122b83cbee56726678588b5',
    [PresetTypedChainId.Goerli]: '0xa1a2b7e08793b3033122b83cbee56726678588b5',
    [PresetTypedChainId.Sepolia]: '0xa1a2b7e08793b3033122b83cbee56726678588b5',
    [PresetTypedChainId.PolygonTestnet]:
      '0xa1a2b7e08793b3033122b83cbee56726678588b5',
    [PresetTypedChainId.OptimismTestnet]:
      '0xa1a2b7e08793b3033122b83cbee56726678588b5',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0xa1a2b7e08793b3033122b83cbee56726678588b5',
  },
  [CurrencyId.WEBBSQR]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '6',
    [PresetTypedChainId.LocalTangleStandalone]: '6',
    [PresetTypedChainId.DkgSubstrateStandalone]: '6',
  },
  [CurrencyId.webbDEV]: {
    [PresetTypedChainId.HermesLocalnet]:
      '0xc705034ded85e817b9E56C977E61A2098362898B',
    [PresetTypedChainId.AthenaLocalnet]:
      '0x91eB86019FD8D7c5a9E31143D422850A13F670A3',
    [PresetTypedChainId.DemeterLocalnet]:
      '0x6595b34ED0a270B10a586FC1EA22030A95386f1e',
  },
  [CurrencyId.TEST]: {
    [PresetTypedChainId.ProtocolSubstrateStandalone]: '9',
  },
};

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8513284,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 8508326,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 2920599,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 5611883,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 32139400,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xa1a2b7e08793b3033122b83cbee56726678588b5': 3771120,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xc705034ded85e817b9E56C977E61A2098362898B': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x91eB86019FD8D7c5a9E31143D422850A13F670A3': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 0,
  },
};

export const getAnchorDeploymentBlockNumber = (
  chainIdType: number,
  contractAddress: string
): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};

/**
 * Get the address of the latest anchor deployed on the chain
 * @param chainIdType the chainIdType of the chain
 * @returns the latest anchor address for the chain
 */
export const getLatestAnchorAddress = (
  chainIdType: number
): string | undefined => {
  const deploymentsBlock = anchorDeploymentBlock[chainIdType];
  if (!deploymentsBlock) {
    return undefined;
  }

  const [address] = Object.entries(deploymentsBlock).reduce(
    ([prevAddress, prevBlockNumber], [address, blockNumber]) => {
      if (blockNumber > prevBlockNumber) {
        return [address, blockNumber];
      }
      return [prevAddress, prevBlockNumber];
    }
  );

  return address;
};
