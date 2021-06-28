import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { WebbApiProvider, WebbMethods, WebbProviderEvents } from '@webb-dapp/react-environment';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { providers } from 'ethers';
import { EventBus } from '@webb-tools/app-util';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { WebbEVMChain } from '@webb-dapp/apps/configs/evm/SupportedMixers';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  private connectedMixers: EvmChainMixersInfo;

  private constructor(private web3Provider: Web3Provider, private chainId: number) {
    super();
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();
    const handler = async () => {
      const chainId = await this.web3Provider.network;
      this.emit('providerUpdate', [chainId]);
      //TODO investigate the off and on methods on ethers
      // @ts-ignore
      // this.ethersProvider.provider?.off?.('chainChanged', handler);
    };
    // @ts-ignore
    this.ethersProvider.provider?.on?.('chainChanged', handler);
    this.connectedMixers = new EvmChainMixersInfo(chainId);
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

  setStorage(chainId: number) {
    this.connectedMixers = new EvmChainMixersInfo(chainId);
  }

  async destroy(): Promise<void> {
    this.subscriptions = {
      providerUpdate: [],
      interactiveFeedback: [],
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
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
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
      throw WebbError.from(WebbErrorCodes.MixerSizeNotFound);
    }

    return new AnchorContract(this.connectedMixers, this.ethersProvider, mixer.address);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  getMixerSizes(tokenSymbol: string): Promise<MixerSize[]> {
    return Promise.resolve(this.connectedMixers.getMixerSizes(tokenSymbol));
  }

  static async init(web3Provider: Web3Provider, chainId: number) {
    return new WebbWeb3Provider(web3Provider, chainId);
  }
}
