import { EVMChainId, evmIdIntoInternalChainId } from '@webb-dapp/apps/configs';
import { mixersConfig } from '@webb-dapp/apps/configs/mixers';
import { evmChainStorageFactory, MixerStorage } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
import { MixerSize } from '@webb-dapp/react-environment';
import { MixerConfig } from '@webb-dapp/react-environment/types/mixer-config.interface';
import { Storage } from '@webb-dapp/utils';

export type LeafIntervalInfo = {
  startingBlock: number;
  endingBlock: number;
  leaves: string[];
};

export class EvmChainMixersInfo {
  private mixerStorage: Storage<MixerStorage> | null = null;
  private mixerConfig: MixerConfig;

  constructor(public evmId: EVMChainId) {
    const webbChainId = evmIdIntoInternalChainId(evmId);
    this.mixerConfig = mixersConfig[webbChainId] ?? { tornMixers: [] };
  }

  getTornMixerSizes(tokenSymbol: string): MixerSize[] {
    const tokenMixers = this.mixerConfig.tornMixers.filter((entry) => entry.symbol == tokenSymbol);
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
      this.mixerStorage = await evmChainStorageFactory(this.evmId);
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
      this.mixerStorage = await evmChainStorageFactory(this.evmId);
    }

    this.mixerStorage.set(contractAddress, {
      lastQueriedBlock,
      leaves,
    });
  }

  getTornMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    const mixerInfo = this.mixerConfig.tornMixers.find(
      (mixer) => mixer.symbol == tokenSymbol && mixer.size == mixerSize
    );
    return mixerInfo;
  }

  getMixerInfoByAddress(contractAddress: string) {
    const allMixers = this.mixerConfig.tornMixers;
    const mixerInfo = allMixers.find((mixer) => mixer.address == contractAddress);
    if (!mixerInfo) {
      throw new Error(`There is no information about the contract ${contractAddress}`);
    }

    return mixerInfo;
  }
}
