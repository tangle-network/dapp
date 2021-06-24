import { MixerSize } from '@webb-dapp/react-environment';
import { Storage } from '@webb-dapp/utils';
import { WebbWeb3Provider, WebbEVMChain } from './webb-web3-provider';
// import { rinkebyMixers, ethMainNetMixers, beresheetMixers } from '@webb-dapp/apps/src/configs/storages/evm-storage';

export const rinkebyMixers = [
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
    createdAtBlock: 1, // should be hardcoded to deployed block number
  },
];

export const ethMainNetMixers = [
  {
    size: 0.1,
    address: '0x876eCe69618e8E8dd743250B036785813824D2D7',
    symbol: 'ETH',
    createdAtBlock: 1,
  },
];

export const beresheetMixers = [
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
export const edgewareMixers = [

];

export type DynamicMixerInfoStore = Record<string, { lastQueriedBlock: number, leaves: string[] }>;

type StaticMixerInfo = { 
  address: string; 
  size: number; 
  symbol: string;
  createdAtBlock: number;
}

export const mixerStorageFactory = (chainId: number) => {

  // localStorage will have key: <name of chain>, value: { Record<contractAddress: string, info: DynamicMixerInfoStore> }
  return Storage.newFromCache<DynamicMixerInfoStore>(WebbWeb3Provider.storageName(chainId), {
    async commit(key: string, data: DynamicMixerInfoStore): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<DynamicMixerInfoStore> {
      const storageCached = localStorage.getItem(key);
      if (storageCached) {
        return {
          ...JSON.parse(storageCached),
        };
      }
      return {

      };
    },
  });
};

export class EvmChainMixersInfo {
  private mixerStorage: Storage<DynamicMixerInfoStore> | null = null;
  private contractsInfo: StaticMixerInfo[];

  constructor( 
    public chainId: number,
  ) {
    switch (chainId) {
      case WebbEVMChain.Rinkeby:
        this.contractsInfo = rinkebyMixers;
        break;
      case WebbEVMChain.Main:
        this.contractsInfo = ethMainNetMixers;
        break;
      case WebbEVMChain.Beresheet:
        this.contractsInfo = beresheetMixers;
        break;
      default:
        this.contractsInfo = rinkebyMixers;
        break;
    }
  }

  getMixersSizes(tokenSymbol: string): MixerSize[] {
    const tokenMixers = this.contractsInfo.filter((entry) => entry.symbol == tokenSymbol);
    return tokenMixers.map((contract) => {
      return {
        id: contract.address,
        title: `${contract.size} ${contract.symbol}`,
      };
    })
  }

  async getMixerInfoStorage(contractAddress: string) {
    // create the mixerStorage if it didn't exist
    if (!this.mixerStorage)
    {
      console.log('mixer storage is being created');
      this.mixerStorage = await mixerStorageFactory(this.chainId);
      console.log(`This is the mixerstorage: ${this.mixerStorage}`);
    }

    // get the info from localStorage
    const storedInfo = await this.mixerStorage.get(contractAddress);

    if (storedInfo) {
      return {
        lastQueriedBlock: storedInfo.lastQueriedBlock,
        leaves: storedInfo.leaves
      };
    }

    return {
      lastQueriedBlock: 1,
      leaves: []
    }
  }

  async setMixerInfoStorage(contractAddress: string, lastQueriedBlock: number, leaves: string[]) {
    if (!this.mixerStorage)
    {
      this.mixerStorage = await mixerStorageFactory(this.chainId);
    }

    this.mixerStorage.set(contractAddress, {
      lastQueriedBlock,
      leaves
    });
  }

  getMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    return this.contractsInfo.find((mixer) => mixer.symbol == tokenSymbol && mixer.size == mixerSize);
  }

  getMixerInfoByAddress(contractAddress: string) {
    return this.contractsInfo.find((mixer) => mixer.address == contractAddress);
  }

}
