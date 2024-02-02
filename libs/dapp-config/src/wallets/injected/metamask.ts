import {
  InjectedConnector,
  InjectedConnectorOptions,
  WindowProvider,
} from '@wagmi/core';
import { Chain } from 'wagmi';
import { getExplicitInjectedProvider } from './utils';

// handle multi injected connectors problem with providers
// Related: https://github.com/wevm/wagmi/discussions/742
export default class MetaMaskConnector extends InjectedConnector {
  readonly id = 'metamask';
  readonly name = 'Metamask';
  readonly ready =
    typeof window != 'undefined' && !!this.#findProvider(window.ethereum);

  #provider?: Window['ethereum'];

  constructor({
    chains,
    options,
  }: { chains?: Chain[]; options?: InjectedConnectorOptions } = {}) {
    super({ chains, options: { name: 'MetaMask Wallet', ...options } });
  }

  async getProvider() {
    if (typeof window !== 'undefined') {
      this.#provider = this.#findProvider(window.ethereum);
      //   this.#provider = getExplicitInjectedProvider('isMetaMask');
    }
    return this.#provider;
  }

  #getReady(provider?: WindowProvider) {
    if (!provider?.isMetaMask) return;
    return provider;
  }

  #findProvider(provider?: WindowProvider) {
    if (provider?.providers)
      return getExplicitInjectedProvider(provider.providers, 'isMetaMask');
    return this.#getReady(provider);
  }
}
