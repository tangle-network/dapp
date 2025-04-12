// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

import {
  WebbApiProvider,
  WebbProviderEvents,
} from '@tangle-network/abstract-api-provider';
import { EventBus } from '@tangle-network/dapp-types/EventBus';
import { ApiConfig } from '@tangle-network/dapp-config';
import { WebbError, WebbErrorCodes } from '@tangle-network/dapp-types';
import {
  ChainType,
  calculateTypedChainId,
} from '@tangle-network/dapp-types/TypedChainId';
import { BehaviorSubject } from 'rxjs';
import { Connection } from '@solana/web3.js';
import { PhantomProvider, SolanaAccounts } from './solana-accounts';
import { TextEncoder } from 'util';

export class WebbSolanaProvider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider
{
  private readonly _newBlock = new BehaviorSubject<null | bigint>(null);
  private unsubscribeFns: Set<() => void>;
  readonly typedChainidSubject: BehaviorSubject<number>;
  private connection: Connection;

  get newBlock() {
    return this._newBlock.asObservable();
  }

  private constructor(
    readonly provider: PhantomProvider,
    protected chainId: number,
    readonly config: ApiConfig,
    readonly accounts: SolanaAccounts,
  ) {
    super();

    const typedChainId = calculateTypedChainId(ChainType.Solana, chainId);
    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    const chain = this.config.chains[typedChainId];
    const rpcUrl =
      chain?.rpcUrls?.default?.http?.[0] || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl);

    this.unsubscribeFns = new Set();

    this.setupBlockSubscription();
  }

  private setupBlockSubscription() {
    const id = this.connection.onSlotChange((slot) => {
      this._newBlock.next(BigInt(slot.slot));
    });

    const unsubscribe = () => {
      this.connection.removeSlotChangeListener(id);
    };

    this.unsubscribeFns.add(unsubscribe);
  }

  static async init(
    provider: PhantomProvider,
    chainId: number,
    appConfig: ApiConfig,
  ) {
    const accounts = new SolanaAccounts(provider);
    return new WebbSolanaProvider(provider, chainId, appConfig, accounts);
  }

  getProvider() {
    return this.provider;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  setAccountListener() {
    const handleAccountsChanged = () => {
      this.emit('newAccounts', this.accounts);
    };

    if (this.provider.on) {
      this.provider.on('accountChanged', handleAccountsChanged);
    }

    const unsubscribe = () => {
      // Handle unsubscribe
    };

    this.unsubscribeFns.add(unsubscribe);
    return unsubscribe;
  }

  setChainListener() {
    const handleNetworkChanged = (network: string) => {
      let chainId: number;
      switch (network) {
        case 'mainnet':
          chainId = 101;
          break;
        case 'testnet':
          chainId = 102;
          break;
        case 'devnet':
        default:
          chainId = 103;
          break;
      }
      this.emit('providerUpdate', [chainId]);
    };

    if (this.provider.on) {
      this.provider.on('networkChanged', handleNetworkChanged);
    }

    const unsubscribe = () => {
      // Note: Handle unsubscribe
    };

    this.unsubscribeFns.add(unsubscribe);
    return unsubscribe;
  }

  async destroy() {
    await this.endSession();
    this.subscriptions = {
      providerUpdate: [],
      newAccounts: [],
    };
  }

  async getChainId() {
    try {
      if (!this.provider.request) {
        return 103;
      }

      const network = await this.provider.request({
        method: 'getNetwork',
        params: {},
      });

      // Map Solana network to chainId
      switch (network) {
        case 'mainnet':
          return 101;
        case 'testnet':
          return 102;
        case 'devnet':
        default:
          return 103;
      }
    } catch (_error) {
      return 103;
    }
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  async endSession(): Promise<void> {
    try {
      if (this.provider.disconnect) {
        await this.provider.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting from Phantom:', error);
    }

    this.unsubscribeFns.forEach((unsub) => unsub());
    return this.unsubscribeAll();
  }

  async sign(message: string): Promise<string> {
    const account = this.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);

      if (!this.provider.signMessage) {
        throw WebbError.from(WebbErrorCodes.FailedToSendTx);
      }

      const { signature } = await this.provider.signMessage(encodedMessage);

      return Buffer.from(signature).toString('hex');
    } catch (error) {
      console.error('Error signing message with Phantom:', error);
      throw WebbError.from(WebbErrorCodes.UnknownError);
    }
  }

  async switchOrAddChain(_solanaChainId: number) {
    throw WebbError.from(WebbErrorCodes.NoSwitchChainMethod);
  }
}
