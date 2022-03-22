import { EVMChainId, evmIdIntoInternalChainId, parseChainIdType } from '@webb-dapp/apps/configs';
import { TornadoContract } from '@webb-dapp/contracts/contracts/tornado-anchor';
import { AnchorContract } from '@webb-dapp/contracts/contracts/webb-anchor';
// eslint-disable-next-line import-newlines/enforce
import {
  AppConfig,
  NotificationHandler,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '@webb-dapp/react-environment';
import { Web3WrapUnwrap } from '@webb-dapp/react-environment/api-providers';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { Web3BridgeApi } from '@webb-dapp/react-environment/api-providers/web3/web3-bridge-api';
import { Web3BridgeDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-bridge-deposit';
import { Web3BridgeWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-bridge-withdraw';
import { Web3ChainQuery } from '@webb-dapp/react-environment/api-providers/web3/web3-chain-query';
import { Web3MixerDeposit } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-deposit';
import { Web3MixerWithdraw } from '@webb-dapp/react-environment/api-providers/web3/web3-mixer-withdraw';
import { MixerSize } from '@webb-dapp/react-environment/webb-context';
import { WebbRelayerBuilder } from '@webb-dapp/react-environment/webb-context/relayer';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Web3Accounts } from '@webb-dapp/wallet/providers/web3/web3-accounts';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { EventBus } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-core';
import { ethers, providers } from 'ethers';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider>
{
  readonly accounts: Web3Accounts;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  private connectedMixers: EvmChainMixersInfo;

  private constructor(
    private web3Provider: Web3Provider,
    private chainId: number,
    readonly relayingManager: WebbRelayerBuilder,
    readonly config: AppConfig,
    readonly notificationHandler: NotificationHandler
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
      wrapUnwrap: {
        core: {
          enabled: true,
          inner: new Web3WrapUnwrap(this),
        },
      },
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
      chainQuery: new Web3ChainQuery(this),
      bridgeApi: new Web3BridgeApi(this, this.config.bridgeByAsset),
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
    await this.endSession();
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

  getTornadoContractAddressByNote(note: Note) {
    const evmId = parseChainIdType(Number(note.note.targetChainId)).chainId as EVMChainId;
    const availableMixers = new EvmChainMixersInfo(evmId);
    const mixer = availableMixers.getTornMixerInfoBySize(Number(note.note.amount), note.note.tokenSymbol);
    if (!mixer) {
      throw new Error('Mixer not found');
    }
    return mixer.address;
  }

  async getContractByAddress(mixerAddress: string): Promise<TornadoContract> {
    return new TornadoContract(this.connectedMixers, this.ethersProvider, mixerAddress);
  }

  getWebbAnchorByAddress(address: string): AnchorContract {
    return new AnchorContract(this.connectedMixers, this.ethersProvider, address);
  }

  getWebbAnchorByAddressAndProvider(address: string, provider: providers.Web3Provider): AnchorContract {
    return new AnchorContract(this.connectedMixers, provider, address, true);
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
  async getContractBySize(mixerSize: number, tokenSymbol: string): Promise<TornadoContract> {
    const mixer = this.connectedMixers.getTornMixerInfoBySize(mixerSize, tokenSymbol);
    if (!mixer) {
      throw WebbError.from(WebbErrorCodes.MixerSizeNotFound);
    }

    return new TornadoContract(this.connectedMixers, this.ethersProvider, mixer.address);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  getMixerSizes(tokenSymbol: string): Promise<MixerSize[]> {
    return Promise.resolve(this.connectedMixers.getTornMixerSizes(tokenSymbol));
  }

  static async init(
    web3Provider: Web3Provider,
    chainId: number,
    relayerBuilder: WebbRelayerBuilder,
    appConfig: AppConfig,
    notification: NotificationHandler
  ) {
    return new WebbWeb3Provider(web3Provider, chainId, relayerBuilder, appConfig, notification);
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
    } catch (e) {
      let err = e as any;
      const code = err?.message.replace('Reverted ', '');
      let reason = ethers.utils.toUtf8String('0x' + code.substr(138));
      return reason;
    }
  }
  switchOrAddChain(evmChainId: number) {
    return this.web3Provider
      .switchChain({
        chainId: `0x${evmChainId.toString(16)}`,
      })
      ?.catch(async (switchError) => {
        console.log('inside catch for switchChain', switchError);

        // cannot switch because network not recognized, so fetch configuration
        const chainId = evmIdIntoInternalChainId(evmChainId);
        const chain = this.config.chains[chainId];

        // prompt to add the chain
        if (switchError.code === 4902) {
          const currency = this.config.currencies[chain.nativeCurrencyId];
          await this.web3Provider.addChain({
            chainId: `0x${evmChainId.toString(16)}`,
            chainName: chain.name,
            rpcUrls: chain.evmRpcUrls!,
            nativeCurrency: {
              decimals: 18,
              name: currency.name,
              symbol: currency.symbol,
            },
          });
          // add network will prompt the switch, check evmId again and throw if user rejected
          const newChainId = await this.web3Provider.network;

          if (newChainId != chain.chainId) {
            throw switchError;
          }
        } else {
          throw switchError;
        }
      });
  }

  public get innerProvider() {
    return this.web3Provider;
  }
}
