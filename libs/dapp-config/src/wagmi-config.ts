import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { chainsConfig } from './chains/evm';
import { SupportedConnector } from './wallets/wallet-config.interface';
import { walletsConfig } from './wallets/wallets-config';

if (!process.env['WALLET_CONNECT_PROJECT_ID']) {
  throw new Error('Missing WALLET_CONNECT_PROJECT_ID');
}

const { publicClient, webSocketPublicClient } = configureChains(
  Object.values(chainsConfig),
  [publicProvider()]
);

const connectors = Object.values(walletsConfig)
  .map((wallet) => wallet.connector)
  .filter((connector): connector is SupportedConnector => !!connector);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default config;
