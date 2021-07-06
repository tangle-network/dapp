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

export class EvmChainMixersInfo {
  private mixerStorage: Storage<MixerStorage> | null = null;
  private mixerInfo: MixerInfo[];

  constructor(public chainId: number) {
    switch (chainId) {
      case WebbEVMChain.Rinkeby:
        this.mixerInfo = rinkebyMixers;
        break;
      case WebbEVMChain.EthereumMainNet:
        this.mixerInfo = ethMainNetMixers;
        break;
      case WebbEVMChain.Beresheet:
        this.mixerInfo = beresheetMixers;
        break;
      case WebbEVMChain.HarmonyTest1:
        this.mixerInfo = harmonyTest1Mixers;
        break;
      default:
        this.mixerInfo = rinkebyMixers;
        break;
    }
  }

  getMixerSizes(tokenSymbol: string): MixerSize[] {
    const tokenMixers = this.mixerInfo.filter((entry) => entry.symbol == tokenSymbol);
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
    const storedInfo = await this.mixerStorage.get(contractAddress);

    if (!storedInfo) {
      return {
        lastQueriedBlock: this.getMixerInfoByAddress(contractAddress).createdAtBlock,
        leaves: [],
      };
    }

    return {
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

  getMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    const mixerInfo = this.mixerInfo.find((mixer) => mixer.symbol == tokenSymbol && mixer.size == mixerSize);
    if (!mixerInfo) {
      throw new Error(`There is no information for a ${tokenSymbol} mixer with size ${mixerSize}`);
    }
    return mixerInfo;
  }

  getMixerInfoByAddress(contractAddress: string) {
    const mixerInfo = this.mixerInfo.find((mixer) => mixer.address == contractAddress);
    if (!mixerInfo) {
      throw new Error(`There is no information about the contract ${contractAddress}`);
    }

    return mixerInfo;
  }
}
