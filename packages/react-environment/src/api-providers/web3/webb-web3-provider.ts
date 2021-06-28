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
import { MixerTitle } from '@webb-dapp/react-environment/webb-context';
import { getStorageName } from '@webb-dapp/apps/configs/storages/EvmChainStorage';

export class WebbWeb3Provider implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  private connectedMixers: EvmChainMixersInfo;

  private constructor(private web3Provider: Web3Provider, private chainId: number) {
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    this.connectedMixers = new EvmChainMixersInfo(chainId);
    // @ts-ignore
    // todo fix me @(AhmedKorim)
    this.ethersProvider.provider?.on?.('chainChanged', async () => {
      const newChainId = await this.web3Provider.network;
      const localName = getStorageName(newChainId);
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

  async getChainId(): Promise<number> {
    const chainId = (await this.ethersProvider.getNetwork()).chainId;
    return chainId;
  }

  getMixers() {
    return this.connectedMixers;
  }

  async getContractByAddress(mixerAddress: string): Promise<AnchorContract> {
    return new AnchorContract(this.connectedMixers, this.ethersProvider, mixerAddress);
  }

  // This function limits the mixer implementation to one type for the token/size pair.
  // Something like a poseidon hasher implementation instead of mimc hasher cannot
  // exist alongside each other.
  async getContractBySize(mixerSize: number, tokenSymbol: string): Promise<AnchorContract> {
    const mixer = this.connectedMixers.getMixerInfoBySize(mixerSize, tokenSymbol);
    if (!mixer) {
      throw new Error(`mixer with size ${mixerSize} not found for chain ${this.connectedMixers.chainId}`);
    }

    return new AnchorContract(this.connectedMixers, this.ethersProvider, mixer.address);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  getMixerTitles(tokenSymbol: string): Promise<MixerTitle[]> {
    return Promise.resolve(this.connectedMixers.getMixerTitles(tokenSymbol));
  }

  static async init(web3Provider: Web3Provider) {
    const chainId = await web3Provider.network;
    return new WebbWeb3Provider(web3Provider, chainId);
  }
}
