import { MixerSize } from '@webb-dapp/react-environment';

export class EvmChainStorage {
  constructor(public contractsAddresses: { address: string; size: number }[]) {}

  get mixerSize(): MixerSize[] {
    return this.contractsAddresses.map((contract, index) => {
      return {
        id: contract.address,
        title: `${contract.size} ETH`,
      };
    });
  }
}
