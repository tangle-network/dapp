import { MixerSize } from '@webb-dapp/react-environment';

export class EvmChainStorage {
  constructor(public contractsInfo: { address: string; size: number; symbol: string; }[]) {}

  get mixerSize(): MixerSize[] {
    return this.contractsInfo.map((contract, index) => {
      return {
        id: contract.address,
        title: `${contract.size} ${contract.symbol}`,
      };
    });
  }
}
