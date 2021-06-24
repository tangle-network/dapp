import Icon from '@material-ui/core/Icon';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import React from 'react';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { Storage } from '@webb-dapp/utils';

export enum WebbEVMChain {
  Main = 1,
  Rinkeby = 4,
  Beresheet = 2022,
}

export class WebbWeb3Provider implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  public connectedMixers: EvmChainMixersInfo;

  private constructor(private web3Provider: Web3Provider, public chainId: number) {
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    this.connectedMixers = new EvmChainMixersInfo(chainId);
    // @ts-ignore
    // todo fix me @(AhmedKorim)
    this.ethersProvider.provider?.on?.('chainChanged', async () => {
      const newChainId = await this.web3Provider.network;
      const localName = WebbWeb3Provider.storageName(newChainId);
      notificationApi({
        message: 'Web3: changed the connected network',
        variant: 'info',
        Icon: React.createElement(Icon, null, ['leak_add']),
        secondaryMessage: `Connection is switched to ${localName} chain`,
      });
      this.ethersProvider = web3Provider.intoEthersProvider();
      this.connectedMixers = new EvmChainMixersInfo(newChainId);
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

  static storageName(chainID: number): string {
    switch (chainID) {
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

  async getChainId(): Promise<number> {
    const chainId = (await this.ethersProvider.getNetwork()).chainId;
    return chainId;
  }

  static getNativeCurrencySymbol(chainID: number): string {
    switch (chainID) {
      case WebbEVMChain.Rinkeby:
        return 'ETH';
      case WebbEVMChain.Main:
        return 'ETH';
      case WebbEVMChain.Beresheet:
        return 'tEDG';
      default:
        throw new Error('unsupported chain');
    }
  }

  async getContractByAddress(mixerAddress: string): Promise<AnchorContract> {
    return new AnchorContract(this, this.ethersProvider, mixerAddress);
  }

  // This function limits the mixer implementation to one type for the token/size pair.
  // Something like a poseidon hasher implementation instead of mimc hasher cannot
  // exist alongside each other.
  async getContractBySize(mixerSize: number, tokenSymbol: string): Promise<AnchorContract> {
    const mixer = this.connectedMixers.getMixerInfoBySize(mixerSize, tokenSymbol);
    if (!mixer) {
      throw new Error(`mixer with size ${mixerSize} not found for chain ${this.connectedMixers.chainId}`);
    }

    this.connectedMixers.getMixerInfoStorage(mixer.address);

    return new AnchorContract(this.connectedMixers, this.ethersProvider, mixer.address);
  }

  static async init(web3Provider: Web3Provider) {
    const chainId = await web3Provider.network;
    
    // If the chain has never been used before, initialize a fresh storage
    if (!Storage.get(this.storageName(chainId))){
      
    }

    return new WebbWeb3Provider(web3Provider, chainId);
  }

  getMixersSizes(tokenSymbol: string): Promise<MixerSize[]> {
    return Promise.resolve(this.connectedMixers.getMixersSizes(tokenSymbol));
  }
}
