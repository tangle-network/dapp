import { MixerSize } from '@webb-dapp/react-environment';
import { Storage } from '@webb-dapp/utils';
import { WebbWeb3Provider, WebbEVMChain } from './webb-web3-provider';
import { rinkebyMixers, ethMainNetMixers, beresheetMixers } from '@webb-dapp/apps/src/configs/storages/evm-storage';

export type DynamicMixerInfoStore = Record<string, { lastQueriedBlock: number, leaves: string[] }>;

type StaticMixerInfo = { 
  address: string; 
  size: number; 
  symbol: string;
  createdAtBlock: number;
}

const mixerStorageFactory = (chainId: number) => {
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
    Promise.resolve(mixerStorageFactory(chainId)).then((createdStorageObject) => {
      this.mixerStorage = createdStorageObject;
    })
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
    // get the info from localStorage
    const storedInfo = await this.mixerStorage?.get(contractAddress);

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
    await this.mixerStorage?.set(contractAddress, {lastQueriedBlock, leaves});
  }

  getMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    return this.contractsInfo.find((mixer) => mixer.symbol == tokenSymbol && mixer.size == mixerSize);
  }

  getMixerInfoByAddress(contractAddress: string) {
    return this.contractsInfo.find((mixer) => mixer.address == contractAddress);
  }

}
