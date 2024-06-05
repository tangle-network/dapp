import { Transport, createClient, fallback, http, type Chain } from 'viem';
import { Config, createConfig } from 'wagmi';
import { chainsConfig } from './chains/evm';
import extractChain from './chains/utils/extractChain';

const chains = Object.values(chainsConfig).map((chainCfg) =>
  extractChain(chainCfg),
) as [Chain, ...Chain[]];

/**
 * TODO: Find a better way to improve the typing of the config
 * with supported chains.
 * @see https://wagmi.sh/react/typescript#config-types
 */
let config: Config<[Chain, ...Chain[]], Record<number, Transport>>;

export type GetWagmiConfigParamsType = {
  isSSR?: boolean;
};

export default function getWagmiConfig({
  isSSR,
}: GetWagmiConfigParamsType = {}) {
  if (config === undefined) {
    config = createConfig({
      ...(typeof isSSR === 'boolean' ? { ssr: isSSR } : {}),
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
