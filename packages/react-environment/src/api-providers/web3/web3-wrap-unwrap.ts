import { ChainId, evmIdIntoChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';
import { Bridge, BridgeConfig, bridgeConfig, BridgeCurrency, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import {
  Amount,
  WrappingEvent,
  WrappingTokenId,
  WrapUnWrap,
} from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type Web3WrapPayload = Amount;
export type Web3UnwrapPayload = Amount;

export class Web3WrapUnwrap extends WrapUnWrap<WebbWeb3Provider> {
  private bridgeConfig: BridgeConfig = bridgeConfig;
  private _currentChainId = new BehaviorSubject<ChainId | null>(null);
  private _event = new Subject<Partial<WrappingEvent>>();

  get subscription(): Observable<Partial<WrappingEvent>> {
    return this._event.asObservable();
  }

  constructor(protected inner: WebbWeb3Provider) {
    super(inner);

    inner.getChainId().then((evmChainId) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
      this._event.next({
        ready: null,
      });
    });

    inner.on('providerUpdate', ([evmChainId]) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
      this._event.next({
        stateUpdate: null,
      });
    });
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  async getWrappedTokens(): Promise<WrappingTokenId[]> {
    const currentToken = this.currentToken;
    const chainId = this._currentChainId.value;
    if (currentToken && chainId && currentToken?.variant === 'governed-token') {
      const webbGovernedToken = this.governedTokenWrapper(String(currentToken.id));
      const tokens = await webbGovernedToken.tokens;
      return Bridge.getTokensByAddress(this.bridgeConfig, tokens).map((i) => ({
        id: i.name,
        variant: 'governed-token',
      }));
    }
    return [];
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  async getNativeTokens(): Promise<WrappingTokenId[]> {
    if (!this._currentChainId) {
      return [];
    }
    const bridgeTokens = Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!).filter(
      (currency) => currency.currencyId !== WebbCurrencyId.WEBB
    );
    const nativeTokens = bridgeTokens.reduce<WebbCurrencyId[]>((acc, brideToken) => {
      return acc.includes(brideToken.currencyId) ? acc : [...acc, brideToken.currencyId];
    }, []);
    return nativeTokens.map((i) => ({
      id: i,
      variant: 'native-token',
    }));
  }

  async getGovernedTokens(): Promise<WrappingTokenId[]> {
    if (this.currentChainId) {
      return Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!)
        .filter((currency) => currency.currencyId !== WebbCurrencyId.WEBB)
        .map((i) => ({
          id: i.name,
          variant: 'governed-token',
        }));
    }
    return [];
  }

  async canUnWrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount } = unwrapPayload;
    const webbGovernedToken = this.governedTokenWrapper(unwrapFrom);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];
    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount } = unwrapPayload;

    const UnwrapTokenId = this.currentToken?.id!;
    const unwrapToken = this.otherEdgToken!;

    const webbGovernedToken = this.governedTokenWrapper(String(UnwrapTokenId));
    if (unwrapToken.variant === 'native-token') {
      const tx = await webbGovernedToken.unwrap(`0x0000000000000000000000000000000000000000`, Number(amount));
      await tx.wait();
      return tx.hash;
    } else {
      const tokenAddress = this.getAddressFromWrapTokenId(String(unwrapToken.id));
      const tx = await webbGovernedToken.unwrap(tokenAddress, Number(amount));
      await tx.wait();
      return tx.hash;
    }
  }

  async canWrap(wrapPayload: Web3WrapPayload): Promise<boolean> {
    const { amount } = wrapPayload;
    const _toWrap = this.otherEdgToken?.id!;
    const wrapInto = this.currentToken?.id!;
    const webbGovernedToken = this.governedTokenWrapper(String(wrapInto));
    return webbGovernedToken.canWrap(Number(amount));
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount } = wrapPayload;
    const toWrap = this.otherEdgToken!;
    const wrapInto = this.currentToken?.id!;
    const webbGovernedToken = this.governedTokenWrapper(wrapInto);

    if (toWrap.variant === 'native-token') {
      const tx = await webbGovernedToken.wrap(`0x0000000000000000000000000000000000000000`, Number(amount));
      await tx.wait();
      return tx.hash;
    } else {
      const tokenAddress = this.getAddressFromWrapTokenId(String(toWrap.id));
      const tx = await webbGovernedToken.wrap(tokenAddress, Number(amount));
      await tx.wait();
      return tx.hash;
    }
  }

  private getAddressFromWrapTokenId(id: string): string {
    const bridgeCurrency = BridgeCurrency.fromString(id);
    const bridgeEntry = Bridge.getConfigEntry(this.bridgeConfig, bridgeCurrency);
    const currentNetwork = this.currentChainId!;

    return bridgeEntry.tokenAddresses[currentNetwork]!;
  }

  governedTokenWrapper(id: string): WebbGovernedToken {
    const bridgeCurrency = BridgeCurrency.fromString(id);
    const bridgeEntry = Bridge.getConfigEntry(this.bridgeConfig, bridgeCurrency);
    const currentNetwork = this.currentChainId!;

    const contractAddress = bridgeEntry.tokenAddresses[currentNetwork]!;
    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}
