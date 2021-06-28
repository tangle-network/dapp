import { MixerTitle } from '@webb-dapp/react-environment';
import { Storage } from '@webb-dapp/utils';
import { MixerStorage, evmChainStorageFactory } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
import {
  beresheetMixers,
  edgewareMixers,
  ethMainNetMixers,
  MixerInfo,
  rinkebyMixers,
  WebbEVMChain,
} from '@webb-dapp/apps/configs/evm/SupportedMixers';

export class EvmChainMixersInfo {
  private mixerStorage: Storage<MixerStorage> | null = null;
  private mixerInfo: MixerInfo[];

  constructor( 
    public chainId: number,
  ) {
    switch (chainId) {
      case WebbEVMChain.Rinkeby:
        this.mixerInfo = rinkebyMixers;
        break;
      case WebbEVMChain.Main:
        this.mixerInfo = ethMainNetMixers;
        break;
      case WebbEVMChain.Beresheet:
        this.mixerInfo = beresheetMixers;
        break;
      case WebbEVMChain.Edgeware:
        this.mixerInfo = edgewareMixers;
        break;
      default:
        this.mixerInfo = rinkebyMixers;
        break;
    }
  }

  getMixerTitles(tokenSymbol: string): MixerTitle[] {
    const tokenMixers = this.mixerInfo.filter((entry) => entry.symbol == tokenSymbol);
    return tokenMixers.map((contract) => {
      return {
        id: contract.address,
        title: `${contract.size} ${contract.symbol}`,
      };
    })
  }

  async getMixerStorage(contractAddress: string) {
    // create the mixerStorage if it didn't exist
    if (!this.mixerStorage)
    {
      this.mixerStorage = await evmChainStorageFactory(this.chainId);
    }

    // get the info from localStorage
    const storedInfo = await this.mixerStorage.get(contractAddress);

    if (!storedInfo) {
      return {
        lastQueriedBlock: this.getMixerInfoByAddress(contractAddress).createdAtBlock,
        leaves: []
      };
    }

    return {
      lastQueriedBlock: storedInfo.lastQueriedBlock,
      leaves: storedInfo.leaves
    };
  }

  async setMixerStorage(contractAddress: string, lastQueriedBlock: number, leaves: string[]) {
    if (!this.mixerStorage)
    {
      this.mixerStorage = await evmChainStorageFactory(this.chainId);
    }

    this.mixerStorage.set(contractAddress, {
      lastQueriedBlock,
      leaves
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
