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
    [PresetTypedChainId.Goerli]: '0x3a4233bf223622f6571b8543498a62b9e2a3b31f',
    [PresetTypedChainId.Sepolia]: '0xb2d1d8d651c53a00e13ea0a363aab575a6886391',
    [PresetTypedChainId.PolygonTestnet]:
      '0xda27349ee55e7c91e1b521ece4c3dcc390383026',
    [PresetTypedChainId.OptimismTestnet]:
      '0x9d36b94f245857ec7280415140800dde7642addb',
    [PresetTypedChainId.MoonbaseAlpha]:
      '0xda27349ee55e7c91e1b521ece4c3dcc390383026',
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
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x3a4233bf223622f6571b8543498a62b9e2a3b31f': 8188267,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0xb2d1d8d651c53a00e13ea0a363aab575a6886391': 2545802,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0xda27349ee55e7c91e1b521ece4c3dcc390383026': 30098018,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x9d36b94f245857ec7280415140800dde7642addb': 3706371,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0xda27349ee55e7c91e1b521ece4c3dcc390383026': 3418157,
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
