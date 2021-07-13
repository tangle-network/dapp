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
];

export const ethMainNetMixers: MixerInfo[] = [

];

export const beresheetMixers: MixerInfo[] = [
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
];

// TODO: Deploy anchor contracts on Mainnet EVM.
export const edgewareMixers: MixerInfo[] = [

];

export const harmonyTest0Mixers: MixerInfo[] = [

];

export const harmonyTest1Mixers: MixerInfo[] = [
  {
    size: 1,
    address: '0x8a4D675dcC71A7387a3C4f27d7D78834369b9542',
    symbol: 'ONE',
    createdAtBlock: 12040000,
  },
  {
    size: 100,
    address: '0x7cd1F52e5EEdf753e99D945276a725CE533AaD1a',
    symbol: 'ONE',
    createdAtBlock: 12040000,
  },
];
