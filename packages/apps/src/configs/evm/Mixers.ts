export enum WebbEVMChain {
  Main = 1,
  Rinkeby = 4,
  Edgeware = 2021,
  Beresheet = 2022,
}

export const getNativeCurrencySymbol = (chainID: number): string => {
  switch (chainID) {
    case WebbEVMChain.Rinkeby:
      return 'ETH';
    case WebbEVMChain.Main:
      return 'ETH';
    case WebbEVMChain.Beresheet:
      return 'tEDG';
    case WebbEVMChain.Edgeware:
      return 'EDG';
    default:
      throw new Error('unsupported chain');
  }
}

export type MixerInfo = {
  address: string;
  size: number;
  symbol: string;
  createdAtBlock: number;
}

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

// TODO: Implement Edgeware evm
export const edgewareMixers: MixerInfo[] = [

];

