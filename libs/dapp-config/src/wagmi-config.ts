import { createClient, fallback, http, type Chain } from 'viem';
import { createConfig } from 'wagmi';
import { chainsConfig } from './chains/evm';
import extractChain from './chains/utils/extractChain';

const chains = Object.values(chainsConfig).map((chainCfg) =>
  extractChain(chainCfg),
) as [Chain, ...Chain[]];

const config = createConfig({
  ssr: true,
  chains,
  client: ({ chain }) => {
    return createClient({
      chain,
      transport: fallback(
        chain.rpcUrls.default.http.map((url) => http(url, { timeout: 60_000 })),
      ),
    });
  },
});

export default config;
