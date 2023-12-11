import { InjectedConnectorOptions, WindowProvider } from '@wagmi/core';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Chain } from 'wagmi';
import { getExplicitInjectedProvider } from './utils';

// handle multi injected connectors problem with providers
// Related: https://github.com/wevm/wagmi/discussions/742
export default class RainbowConnector extends InjectedConnector {
  readonly id = 'rainbow';
  readonly name = 'rainbow';
  readonly ready =
    typeof window != 'undefined' && !!this.#findProvider(window.ethereum);

  #provider?: Window['ethereum'];

  constructor({
    chains,
    options,
  }: { chains?: Chain[]; options?: InjectedConnectorOptions } = {}) {
    super({ chains, options: { name: 'Rainbow Wallet', ...options } });
  }

  async getProvider() {
    if (typeof window !== 'undefined') {
      this.#provider = this.#findProvider(window.ethereum);
    }
    return this.#provider;
  }

  #getReady(provider?: WindowProvider) {
    if (!provider?.isRainbow) return;
    return provider;
  }

  #findProvider(provider?: WindowProvider) {
    if (provider?.providers)
      return getExplicitInjectedProvider(provider.providers, 'isRainbow');
    return this.#getReady(provider);
  }
}
