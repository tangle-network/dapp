import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.inerface';
import { Storage } from '@webb-dapp/utils';

export enum WebbEVMChain {
  Production,
  Rinkybe = 'rinkeby',
}

export class WebbWeb3Provider implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private readonly ethersProvider: providers.Web3Provider;

  private constructor(private web3Provider: Web3Provider, private storage: Storage<EvmChainStorage>) {
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    this.methods = {
      mixer: {
        deposit: {
          enabled: false,
          inner: new Web3MixerDeposit(this),
        },
        withdraw: {
          enabled: false,
          inner: new Web3MixerWithdraw(this),
        },
      },
    };
  }

  static chainType(name: string): WebbEVMChain {
    switch (name) {
      case WebbEVMChain.Rinkybe:
        return WebbEVMChain.Rinkybe;
      default:
        throw new Error('unsupported chain');
    }
  }

  get chainStorage(): Promise<EvmChainStorage> {
    return this.storage.dump();
  }

  getContract(contractAddress: string): AnchorContract {
    return new AnchorContract(this.ethersProvider, contractAddress);
  }

  static async init(web3Provider: Web3Provider, storage: Storage<EvmChainStorage>) {
    return new WebbWeb3Provider(web3Provider, storage);
  }
}
