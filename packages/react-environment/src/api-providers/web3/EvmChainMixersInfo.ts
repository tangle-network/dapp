import { WebbEVMChain } from '@webb-dapp/apps/configs';
import {
  beresheetMixers,
  harmonyTest1Mixers,
  ethMainNetMixers,
  MixerInfo,
  rinkebyMixers,
} from '@webb-dapp/apps/configs/evm/SupportedMixers';
import { evmChainStorageFactory, MixerStorage } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
import { MixerSize } from '@webb-dapp/react-environment';
import { Storage } from '@webb-dapp/utils';

export type LeafIntervalInfo = {
  startingBlock: number;
  endingBlock: number;
  leaves: string[];
};

export class EvmChainMixersInfo {
  private mixerStorage: Storage<MixerStorage> | null = null;
  private tornMixerInfo: MixerInfo[];

  constructor(public chainId: number) {
    switch (chainId) {
      case WebbEVMChain.Rinkeby:
        this.tornMixerInfo = rinkebyMixers.tornMixers;
        break;
      case WebbEVMChain.EthereumMainNet:
        this.tornMixerInfo = ethMainNetMixers.tornMixers;
        break;
      case WebbEVMChain.Beresheet:
        this.tornMixerInfo = beresheetMixers.tornMixers;
        break;
      case WebbEVMChain.HarmonyTestnet1:
        this.tornMixerInfo = harmonyTest1Mixers.tornMixers;
        break;
      default:
        this.tornMixerInfo = rinkebyMixers.tornMixers;
        break;
    }
  }

  getTornMixerSizes(tokenSymbol: string): MixerSize[] {
    const tokenMixers = this.tornMixerInfo.filter((entry) => entry.symbol == tokenSymbol);
    return tokenMixers.map((contract) => {
      return {
        id: contract.address,
        title: `${contract.size} ${contract.symbol}`,
      };
    });
  }

  async getMixerStorage(contractAddress: string) {
    // create the mixerStorage if it didn't exist
    if (!this.mixerStorage) {
      this.mixerStorage = await evmChainStorageFactory(this.chainId);
    }

    // get the info from localStorage
    const mixerInfo = this.getMixerInfoByAddress(contractAddress);
    const storedInfo = await this.mixerStorage.get(contractAddress);

    if (!storedInfo) {
      return {
        lastQueriedBlock: mixerInfo.createdAtBlock,
        leaves: [],
      };
    }

    return {
      createdAtBlock: mixerInfo.createdAtBlock,
      lastQueriedBlock: storedInfo.lastQueriedBlock,
      leaves: storedInfo.leaves,
    };
  }

  async setMixerStorage(contractAddress: string, lastQueriedBlock: number, leaves: string[]) {
    if (!this.mixerStorage) {
      this.mixerStorage = await evmChainStorageFactory(this.chainId);
    }

    this.mixerStorage.set(contractAddress, {
      lastQueriedBlock,
      leaves,
    });
  }

  getTornMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    const mixerInfo = this.tornMixerInfo.find((mixer) => mixer.symbol == tokenSymbol && mixer.size == mixerSize);
    if (!mixerInfo) {
      throw new Error(`There is no information for a ${tokenSymbol} mixer with size ${mixerSize}`);
    }
    return mixerInfo;
  }

  getMixerInfoByAddress(contractAddress: string) {
    const allMixers = this.tornMixerInfo;
    const mixerInfo = allMixers.find((mixer) => mixer.address == contractAddress);
    if (!mixerInfo) {
      throw new Error(`There is no information about the contract ${contractAddress}`);
    }

    return mixerInfo;
  }
}
