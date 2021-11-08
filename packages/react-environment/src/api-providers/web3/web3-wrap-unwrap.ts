import { WrapUnWrap } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency, MixerSize } from '@webb-dapp/react-environment';
import { ChainId, evmIdIntoChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BehaviorSubject } from 'rxjs';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';

export type Web3WrapPayload = {
  wrapFrom: string;
  wrapInto: string;
  amount: string;
};
export type Web3UnwrapPayload = {
  unwrapFrom: string;
  unwrapInto: string;
  amount: string;
};

export class Web3WrapUnwrap extends WrapUnWrap<WebbWeb3Provider, Web3WrapPayload, Web3UnwrapPayload> {
  private bridgeConfig: BridgeConfig = bridgeConfig;
  private _currentChainId = new BehaviorSubject<ChainId | null>(null);

  constructor(protected inner: WebbWeb3Provider) {
    super(inner);
    inner.getChainId().then((evmChainId) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
    });
    inner.on('providerUpdate', ([evmChainId]) => {
      this._currentChainId.next(evmIdIntoChainId(evmChainId));
    });
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }

  async getWrappedTokens(): Promise<BridgeCurrency[]> {
    const currentToken = this.currentToken;
    const chainId = this._currentChainId.value;
    if (currentToken && chainId) {
      const webbGovernedToken = this.governedTokenWrapper(currentToken);
      const tokens = await webbGovernedToken.tokens;
      return Bridge.getTokensByAddress(this.bridgeConfig, tokens);
    }
    return [];
  }

  private get currentChainId() {
    return this._currentChainId.value;
  }

  async getNativeTokens(): Promise<WebbCurrencyId[]> {
    if (!this._currentChainId) {
      return [];
    }
    const bridgeTokens = Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!).filter(
      (currency) => currency.currencyId !== WebbCurrencyId.WEBB
    );
    const nativeTokens = bridgeTokens.reduce<WebbCurrencyId[]>((acc, brideToken) => {
      return acc.includes(brideToken.currencyId) ? acc : [...acc, brideToken.currencyId];
    }, []);
    return nativeTokens as any;
  }

  async getGovernedTokens(): Promise<BridgeCurrency[]> {
    if (this.currentToken) {
      return Bridge.getTokensOfChain(this.bridgeConfig, this.currentChainId!).filter(
        (currency) => currency.currencyId !== WebbCurrencyId.WEBB && currency.currencyId === this.currentToken
      );
    }
    return [];
  }

  async canUnWrap(unwrapPayload: Web3UnwrapPayload): Promise<boolean> {
    const { amount, unwrapFrom } = unwrapPayload;
    const webbGovernedToken = this.governedTokenWrapper(unwrapFrom);

    const account = await this.inner.accounts.accounts();
    const currentAccount = account[0];
    return webbGovernedToken.canUnwrap(currentAccount.address, Number(amount));
  }

  async unwrap(unwrapPayload: Web3UnwrapPayload): Promise<string> {
    const { amount, unwrapFrom } = unwrapPayload;
    const webbGovernedToken = this.governedTokenWrapper(unwrapFrom);

    const tx = await webbGovernedToken.unwrap(`0x0000000000000000000000000000000000000000`, Number(amount));
    await tx.wait();
    return tx.hash;
  }

  async canWrap(wrapPayload: Web3WrapPayload): Promise<boolean> {
    const { amount, wrapInto } = wrapPayload;
    const webbGovernedToken = this.governedTokenWrapper(wrapInto);
    return webbGovernedToken.canWrap(Number(amount));
  }

  async wrap(wrapPayload: Web3WrapPayload): Promise<string> {
    const { amount, wrapFrom, wrapInto } = wrapPayload;

    const webbGovernedToken = this.governedTokenWrapper(wrapInto);

    const tx = await webbGovernedToken.wrap(Number(amount));
    await tx.wait();
    return tx.hash;
  }

  governedTokenWrapper(tokenWrapperAddress: string): WebbGovernedToken {
    const bridgeCurrency = BridgeCurrency.fromString(tokenWrapperAddress);
    const bridgeEntry = Bridge.getConfigEntry(this.bridgeConfig, bridgeCurrency);
    const currentNetwork = this.currentChainId!;

    const contractAddress = bridgeEntry.tokenAddresses[currentNetwork]!;
    return new WebbGovernedToken(this.inner.getEthersProvider(), contractAddress);
  }
}
