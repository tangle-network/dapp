import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.inerface';
import { Storage } from '@webb-dapp/utils';
import { notificationApi } from '@webb-dapp/ui-components/notification';

export enum WebbEVMChain {
  Production,
  Rinkybe = 'rinkeby',
}

export type EVMStorage = Record<string, EvmChainStorage>;

export class WebbWeb3Provider implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;

  private constructor(private web3Provider: Web3Provider, private storage: Storage<EVMStorage>) {
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    // @ts-ignore
    // todo fix me @(AhmedKorim)
    this.ethersProvider.provider?.on?.('chainChanged', async () => {
      const chaninName = await this.web3Provider.netowrk;
      notificationApi({
        message: 'Web3: changed the connect network',
        variant: 'info',
        secondaryMessage: `Connection is switched to ${chaninName} chain`,
      });
      this.ethersProvider = web3Provider.intoEthersProvider();
    });
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

  static chainType(name: string): WebbEVMChain {
    switch (name) {
      case WebbEVMChain.Rinkybe:
        return WebbEVMChain.Rinkybe;
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
    const mixer = mixerSizes.contractsAddresses.find((config) => config.size === Number(mixerSize));
    if (!mixer) {
      throw new Error(`mixer size  not found on this contract`);
    }

    return new AnchorContract(this.ethersProvider, mixer.address);
  }

  static async init(web3Provider: Web3Provider, storage: Storage<EVMStorage>) {
    return new WebbWeb3Provider(web3Provider, storage);
  }
}
