import { ChainId, chainsConfig, currenciesConfig } from '@webb-dapp/apps/configs';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';

export const getNativeCurrencySymbol = (evmId: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.evmId === evmId);
  if (chain) {
    const nativeCurrency = chain.nativeCurrencyId;
    return currenciesConfig[nativeCurrency].symbol;
  }
  return 'Unknown';
};

export const getEVMChainName = (evmId: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.evmId === evmId);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const getEVMChainNameFromInternal = (chainID: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.id === chainID);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const mixersConfig: AppConfig['mixers'] = {
  [ChainId.Edgeware]: {
    tornMixers: [
      {
        size: 10000,
        address: '0x2B9A7085Afba278BEc6bBfFb399A3C042ED05046',
        symbol: 'EDG',
        createdAtBlock: 8828000,
      },
    ],
  },
  [ChainId.EdgewareTestNet]: {
    tornMixers: [
      {
        size: 10,
        address: '0xf0EA8Fa17daCF79434d10C51941D8Fc24515AbE3',
        symbol: 'tEDG',
        createdAtBlock: 299740,
      },
      {
        size: 100,
        address: '0xc0d863EE313636F067dCF89e6ea904AD5f8DEC65',
        symbol: 'tEDG',
        createdAtBlock: 299740,
      },
      {
        size: 1000,
        address: '0xc7c6152214d0Db4e161Fa67fB62811Be7326834A',
        symbol: 'tEDG',
        createdAtBlock: 299740,
      },
      {
        size: 10000,
        address: '0xf0290d80880E3c59512e454E303FcD48f431acA3',
        symbol: 'tEDG',
        createdAtBlock: 299740,
      },
    ],
  },
  [ChainId.Rinkeby]: {
    tornMixers: [
      {
        size: 0.1,
        address: '0x626FEc5Ffa7Bf1EE8CEd7daBdE545630473E3ABb',
        symbol: 'ETH',
        createdAtBlock: 8896800, // should be hardcoded to deployed block number
      },
      {
        size: 1,
        address: '0x979cBd4917e81447983ef87591B9E1ab21727a61',
        symbol: 'ETH',
        createdAtBlock: 8896800,
      },
    ],
  },
  [ChainId.HarmonyTestnet1]: {
    tornMixers: [
      {
        size: 100,
        address: '0x7cd1F52e5EEdf753e99D945276a725CE533AaD1a',
        symbol: 'ONE',
        createdAtBlock: 12040000,
      },
      {
        size: 1000,
        address: '0xD7f9BB9957100310aD397D2bA31771D939BD4731',
        symbol: 'ONE',
        createdAtBlock: 12892487,
      },
      {
        size: 10000,
        address: '0xeE2eB8F142e48e5D1bDD34e0924Ed3B4aa0d4222',
        symbol: 'ONE',
        createdAtBlock: 12892648,
      },
      {
        size: 100000,
        address: '0x7cd173094eF78FFAeDee4e14576A73a79aA716ac',
        symbol: 'ONE',
        createdAtBlock: 12892840,
      },
    ],
  },
  [ChainId.HarmonyMainnet0]: {
    tornMixers: [
      {
        size: 100,
        address: '0x2B9A7085Afba278BEc6bBfFb399A3C042ED05046',
        symbol: 'ONE',
        createdAtBlock: 18796580,
      },
      {
        size: 10000,
        address: '0x4b271E1E67B3eE56467599cd46f1F74A5a369c72',
        symbol: 'ONE',
        createdAtBlock: 18796580,
      },
    ],
  },
  [ChainId.Shiden]: {
    tornMixers: [
      {
        size: 10,
        address: '0x2B9A7085Afba278BEc6bBfFb399A3C042ED05046',
        symbol: 'SDN',
        createdAtBlock: 566000,
      },
      {
        size: 1000,
        address: '0x548555a3275B6fadD5d2B9740a7655cB7f856148',
        symbol: 'SDN',
        createdAtBlock: 568000,
      },
    ],
  },
};
