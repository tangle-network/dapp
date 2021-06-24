import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.interface';
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods, WebbProviderEvents } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { Storage } from '@webb-dapp/utils';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import { EventBus } from '@webb-tools/app-util';

export enum WebbEVMChain {
  Main = 1,
  Rinkeby = 4,
  Beresheet = 2022,
}

export type EVMStorage = Record<string, EvmChainStorage>;

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;

  private constructor(private web3Provider: Web3Provider, private storage: Storage<EVMStorage>) {
    super();
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    const handler = async () => {
      const chainId = await this.web3Provider.network;
      this.emit('providerUpdate', [chainId]);
      this.ethersProvider.provider?.off?.('chainChanged', handler);
    };
    this.ethersProvider.provider?.on?.('chainChanged', handler);
    this.methods = {
      mixer: {
        deposit: {
          enabled: true,
          inner: new Web3MixerDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new Web3MixerWithdraw(this),
        },
      },
    };
  }

  async destroy(): Promise<void> {}

  static storageName(id: number): string {
    switch (id) {
      case WebbEVMChain.Rinkeby:
        return 'rinkeby';
      case WebbEVMChain.Main:
        return 'main';
      case WebbEVMChain.Beresheet:
        return 'beresheet';
      default:
        throw new Error('unsupported chain');
    }
  }

  get chainStorage(): Promise<EVMStorage> {
    return this.storage.dump();
  }

  async getContractWithAddress(mixerId: string): Promise<AnchorContract> {
    return new AnchorContract(this.ethersProvider, mixerId);
  }

  async getContract(mixerSize: number, name: string): Promise<AnchorContract> {
    const mixerSizes = await this.storage.get(name);
    const mixer = mixerSizes.contractsInfo.find((config) => config.size === Number(mixerSize));
    console.log(mixer);
    if (!mixer) {
      throw new Error(`mixer size  not found on this contract`);
    }

    return new AnchorContract(this.ethersProvider, mixer.address);
  }

  static async init(web3Provider: Web3Provider, storage: Storage<EVMStorage>) {
    return new WebbWeb3Provider(web3Provider, storage);
  }
}
