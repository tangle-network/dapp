import Icon from '@material-ui/core/Icon';
import { EvmChainStorage } from '@webb-dapp/apps/configs/storages/evm-chain-storage.interface';
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Storage } from '@webb-dapp/utils';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import React from 'react';

export enum WebbEVMChain {
  Main = 1,
  Rinkeby = 4,
  Beresheet = 2022,
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
      const chainId = await this.web3Provider.network;
      console.log(chainId);
      const localName = await WebbWeb3Provider.storageName(chainId);
      notificationApi({
        message: 'Web3: changed the connected network',
        variant: 'info',
        Icon: React.createElement(Icon, null, ['leak_add']),
        secondaryMessage: `Connection is switched to ${chainId} chain`,
      });
      this.ethersProvider = web3Provider.intoEthersProvider();
      this.storage = await Storage.get(localName);
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
