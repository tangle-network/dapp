import { chainsConfig, currenciesConfig } from '@webb-dapp/apps/configs';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';

export const getNativeCurrencySymbol = (chainID: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.evmId === chainID);
  if (chain) {
    const nativeCurrency = chain.nativeCurrencyId;
    return currenciesConfig[nativeCurrency].symbol;
  }
  return 'Unknown';
};

export const getEVMChainName = (chainID: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.evmId === chainID);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export type MixerInfo = {
  address: string;
  size: number;
  symbol: string;
  createdAtBlock: number;
};

export const rinkebyMixers: MixerInfo[] = [
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
    createdAtBlock: 1, // should be hardcoded to deployed block number
  },
];

export const ethMainNetMixers: MixerInfo[] = [
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
    createdAtBlock: 1,
  },
];

export const beresheetMixers: MixerInfo[] = [
  {
    size: 10,
    address: '0x5f771fc87F87DB48C9fB11aA228D833226580689',
    symbol: 'tEDG',
    createdAtBlock: 3000,
  },
  {
    size: 100,
    address: '0x2ee2e51cab1561E4482cacc8Be8b46CE61E46991',
    symbol: 'tEDG',
    createdAtBlock: 3000,
  },
  {
    size: 1000,
    address: '0x5696b4AfBc169454d7FA26e0a41828d445CFae20',
    symbol: 'tEDG',
    createdAtBlock: 3000,
  },
  {
    size: 10000,
    address: '0x626FEc5Ffa7Bf1EE8CEd7daBdE545630473E3ABb',
    symbol: 'tEDG',
    createdAtBlock: 3000,
  },
];

// TODO: Deploy anchor contracts on Mainnet EVM.
export const edgewareMixers: MixerInfo[] = [

];

export const harmonyTest0Mixers: MixerInfo[] = [
  {
    size: 1,
    address: '0xF06fA633f6E801d9fF3D450Af8806489D4fa70a1',
    symbol: 'ONE',
    createdAtBlock: 11538800,
  },
  {
    size: 100,
    address: '0x5f771fc87F87DB48C9fB11aA228D833226580689',
    symbol: 'ONE',
    createdAtBlock: 11561900,
  },
];

export const harmonyTest1Mixers: MixerInfo[] = [
  {
    size: 1,
    address: '0x59DCE3dcA8f47Da895aaC4Df997d8A2E29815B1B',
    symbol: 'ONE',
    createdAtBlock: 11733680,
  },
  {
    size: 100,
    address: '0xF06fA633f6E801d9fF3D450Af8806489D4fa70a1',
    symbol: 'ONE',
    createdAtBlock: 11733680,
  },
];
