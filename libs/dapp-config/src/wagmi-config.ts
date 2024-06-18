import { createClient, fallback, http } from 'viem';
import { Config, cookieStorage, createConfig, createStorage } from 'wagmi';
import { wagmiChains as chains } from './chains/evm';

let config: Config<typeof chains>;

/**
 * Registers the wagmi config
 *
 * @see {@link https://wagmi.sh/react/typescript#config-types}
 */
declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export type GetWagmiConfigParamsType = {
  isSSR?: boolean;
};

export default function getWagmiConfig({
  isSSR,
}: GetWagmiConfigParamsType = {}) {
  if (config === undefined) {
    config = createConfig({
      ...(typeof isSSR === 'boolean' ? { ssr: isSSR } : {}),
      ...(isSSR === true
        ? {
            storage: createStorage({
              storage: cookieStorage,
            }),
          }
        : {}),
      chains,
      client: ({ chain }) => {
        return createClient({
          chain,
          transport: fallback(
            chain.rpcUrls.default.http.map((url) =>
              http(url, { timeout: 60_000 }),
            ),
          ),
        });
      },
    });
  }

  return config;
}
