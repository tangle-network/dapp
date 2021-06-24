import { MixerSize } from '@webb-dapp/react-environment';

export class EvmChainStorage {
  constructor( 
    // public mixersInfo: [
    // asset: Record<string, // assets indexed on token symbol.
    //   {
    //     type: string, // the type of mixer, native, erc20, etc.
    //     data: [
    //       Record<string, // Data array for mixers indexed on address
    //       {
    //         size: number,
    //         syncedBlock: number,
    //         leaves: string[],
    //       }>,
    //     ]
    //   }>
    // ]
    
    public contractsInfo: { 
      address: string; 
      size: number; 
      symbol: string; 
      syncedBlock: number;
      leaves: string[];
    }[]
  ) {
    // On construction, retrieve the 

  }

  getMixersInfo(): MixerSize[] {
    return this.contractsInfo.map((contract, index) => {
      return {
        id: contract.address,
        title: `${contract.size} ${contract.symbol}`,
      };
    });
  }
}
