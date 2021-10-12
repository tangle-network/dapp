import { TornadoAnchorContract } from '@webb-dapp/contracts/contracts/tornado-anchor';
import { WebbApiProvider, WebbMethods, WebbProviderEvents } from '@webb-dapp/react-environment';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { Web3BridgeDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-bridge-deposit';
import { Web3BridgeWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-bridge-withdraw';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { EventBus } from '@webb-tools/app-util';
import { ethers, providers } from 'ethers';
import { WebbAnchorContract } from '@webb-dapp/contracts/contracts';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider> {
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  private connectedMixers: EvmChainMixersInfo;

  private constructor(
    private web3Provider: Web3Provider,
    private chainId: number,
    readonly relayingManager: WebbRelayerBuilder
  ) {
    super();
    this.accounts = new Web3Accounts(web3Provider.eth);
    this.ethersProvider = web3Provider.intoEthersProvider();

    // Remove listeners for chainChanged on the previous object
    // @ts-ignore
    this.ethersProvider.provider?.removeAllListeners('chainChanged');

    // @ts-ignore
    this.ethersProvider.provider?.on?.('accountsChanged', () => {
      this.emit('newAccounts', this.accounts);
    });
    this.connectedMixers = new EvmChainMixersInfo(chainId);
    this.methods = {
      bridge: {
        core: null,
        deposit: {
          inner: new Web3BridgeDeposit(this),
          enabled: true,
        },
        withdraw: {
          inner: new Web3BridgeWithdraw(this),
          enabled: true,
        },
      },
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

  getProvider(): Web3Provider {
    return this.web3Provider;
  }

  async setChainListener() {
    this.ethersProvider = this.web3Provider.intoEthersProvider();
    const handler = async () => {
      const chainId = await this.web3Provider.network;
      this.emit('providerUpdate', [chainId]);
    };
    // @ts-ignore
    this.ethersProvider.provider?.on?.('chainChanged', handler);
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

  async getChainId(): Promise<number> {
    const chainId = (await this.ethersProvider.getNetwork()).chainId;
    return chainId;
  }

  getMixers() {
    return this.connectedMixers;
  }

  async getContractByAddress(mixerAddress: string): Promise<TornadoAnchorContract> {
    return new TornadoAnchorContract(this.connectedMixers, this.ethersProvider, mixerAddress);
  }

  getWebbAnchorByAddress(address: string): WebbAnchorContract {
    return new WebbAnchorContract(this.connectedMixers, this.ethersProvider, address);
  }

  getWebbAnchorByAddressAndProvider(address: string, provider: providers.Web3Provider): WebbAnchorContract {
    return new WebbAnchorContract(this.connectedMixers, provider, address, true);
  }

  getMixerInfoBySize(mixerSize: number, tokenSymbol: string) {
    const mixer = this.connectedMixers.getTornMixerInfoBySize(mixerSize, tokenSymbol);
    if (!mixer) {
      throw WebbError.from(WebbErrorCodes.MixerSizeNotFound);
    }
    return mixer;
  }

  // This function limits the mixer implementation to one type for the token/size pair.
  // Something like a poseidon hasher implementation instead of mimc hasher cannot
  // exist alongside each other.
  async getContractBySize(mixerSize: number, tokenSymbol: string): Promise<TornadoAnchorContract> {
    const mixer = this.connectedMixers.getTornMixerInfoBySize(mixerSize, tokenSymbol);
    if (!mixer) {
      throw WebbError.from(WebbErrorCodes.MixerSizeNotFound);
    }

    return new TornadoAnchorContract(this.connectedMixers, this.ethersProvider, mixer.address);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  getMixerSizes(tokenSymbol: string): Promise<MixerSize[]> {
    return Promise.resolve(this.connectedMixers.getTornMixerSizes(tokenSymbol));
  }

  static async init(web3Provider: Web3Provider, chainId: number, relayerBuilder: WebbRelayerBuilder) {
    return new WebbWeb3Provider(web3Provider, chainId, relayerBuilder);
  }

  get capabilities() {
    return this.web3Provider.capabilities;
  }

  endSession(): Promise<void> {
    return this.web3Provider.endSession();
  }

  async reason(hash: string) {
    const a = await this.ethersProvider.getTransaction(hash);
    if (!a) {
      throw new Error('TX not found');
    }
    try {
      // @ts-ignore
      let code = await this.ethersProvider.call(a, a.blockNumber);
      console.log({ ERRORCODE: code });
    } catch (err) {
      console.log({ e: err });
      const code = err.message.replace('Reverted ', '');
      let reason = ethers.utils.toUtf8String('0x' + code.substr(138));
      return reason;
    }
  }

  public get innerProvider() {
    return this.web3Provider;
  }
}
