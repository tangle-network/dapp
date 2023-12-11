import { SupportedBrowsers } from '@webb-tools/browser-utils/platform';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { WalletId } from '@webb-tools/dapp-types/WalletId';
import {
  MetaMaskIcon,
  PolkadotJsIcon,
  RainbowIcon,
  SubWalletIcon,
  TalismanIcon,
  WalletConnectIcon,
} from '@webb-tools/icons';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector, RainbowConnector } from './injected';
import { chainsConfig as evmChainsConfig } from '../chains/evm';
import { HUBBLE_BRIDGE_DAPP_NAME } from '../constants';
import getPolkadotBasedWallet from '../utils/getPolkadotBasedWallet';
import type { WalletConfig } from './wallet-config.interface';

const ANY_EVM = [
  PresetTypedChainId.EthereumMainNet,

  // Testnet
  PresetTypedChainId.Goerli,
  PresetTypedChainId.Sepolia,
  PresetTypedChainId.HarmonyTestnet1,
  PresetTypedChainId.HarmonyTestnet0,
  PresetTypedChainId.Shiden,
  PresetTypedChainId.OptimismTestnet,
  PresetTypedChainId.ArbitrumTestnet,
  PresetTypedChainId.PolygonTestnet,
  PresetTypedChainId.MoonbaseAlpha,
  PresetTypedChainId.AvalancheFuji,
  PresetTypedChainId.ScrollAlpha,

  // Self hosted
  PresetTypedChainId.HermesOrbit,
  PresetTypedChainId.AthenaOrbit,
  PresetTypedChainId.DemeterOrbit,
  PresetTypedChainId.TangleTestnet,

  // Localnet
  PresetTypedChainId.HermesLocalnet,
  PresetTypedChainId.AthenaLocalnet,
  PresetTypedChainId.DemeterLocalnet,
];

const ANY_SUBSTRATE = [
  PresetTypedChainId.LocalTangleStandalone,
  PresetTypedChainId.DkgSubstrateStandalone,
  PresetTypedChainId.ProtocolSubstrateStandalone,
  PresetTypedChainId.Kusama,
  PresetTypedChainId.Polkadot,
];

export const connectors = {
  [WalletId.MetaMask]: new MetaMaskConnector({
    chains: Object.values(evmChainsConfig),
  }),
  [WalletId.WalletConnectV2]: new WalletConnectConnector({
    options: {
      projectId: process.env['BRIDGE_DAPP_WALLET_CONNECT_PROJECT_ID'] ?? '',
    },
  }),
  [WalletId.Rainbow]: new RainbowConnector({
    chains: Object.values(evmChainsConfig),
  }),
};

export const walletsConfig: Record<number, WalletConfig> = {
  // TODO: Should move all hardcoded wallet configs to connectors
  // https://wagmi.sh/examples/custom-connector
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    Logo: <PolkadotJsIcon />,
    name: 'polkadot-js',
    title: `PolkadotJS Extension`,
    platform: 'Substrate',
    enabled: true,
    async detect() {
      return getPolkadotBasedWallet(HUBBLE_BRIDGE_DAPP_NAME, 'polkadot-js');
    },
    supportedChainIds: [...ANY_SUBSTRATE],
    homeLink: 'https://polkadot.js.org/extension',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/firefox/addon/polkadot-js-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
    },
  },
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: <MetaMaskIcon />,
    name: 'metamask',
    title: `MetaMask`,
    platform: 'EVM',
    enabled: true,
    async detect() {
      const metaMaskConnector = connectors[WalletId.MetaMask];
      const provider = await metaMaskConnector.getProvider();
      if (!provider) {
        return;
      }

      return metaMaskConnector;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://metamask.io/',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/firefox/addon/ether-metamask/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
    },
    connector: connectors[WalletId.MetaMask],
  },
  [WalletId.WalletConnectV2]: {
    id: WalletId.WalletConnectV2,
    Logo: <WalletConnectIcon />,
    name: 'wallet connect',
    title: `Wallet Connect`,
    platform: 'EVM',
    enabled: true,
    async detect() {
      return connectors[WalletId.WalletConnectV2];
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://walletconnect.com/',
    connector: connectors[WalletId.WalletConnectV2],
  },
  [WalletId.Rainbow]: {
    id: WalletId.Rainbow,
    Logo: <RainbowIcon />,
    name: 'rainbow',
    title: 'Rainbow',
    platform: 'EVM',
    enabled: true,
    async detect() {
      const conn = connectors[WalletId.Rainbow];
      const provider = await conn.getProvider();
      if (!provider) {
        return;
      }

      return conn;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://rainbow.me/',
    connector: connectors[WalletId.Rainbow],
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/rainbow-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/rainbow/opfgelmcmbiajamepnmloijbpoleiama',
    },
  },
  [WalletId.Talisman]: {
    id: WalletId.Talisman,
    Logo: <TalismanIcon />,
    name: 'talisman',
    title: 'Talisman',
    platform: 'Substrate',
    enabled: true,
    detect() {
      return getPolkadotBasedWallet(HUBBLE_BRIDGE_DAPP_NAME, 'talisman');
    },
    supportedChainIds: [...ANY_SUBSTRATE],
    homeLink: 'https://talisman.xyz/',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/firefox/addon/talisman-wallet-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    },
  },
  [WalletId.SubWallet]: {
    id: WalletId.SubWallet,
    Logo: <SubWalletIcon />,
    name: 'subwallet-js',
    title: 'SubWallet',
    platform: 'Substrate',
    enabled: true,
    detect() {
      return getPolkadotBasedWallet(HUBBLE_BRIDGE_DAPP_NAME, 'subwallet-js');
    },
    supportedChainIds: [...ANY_SUBSTRATE],
    homeLink: 'https://www.subwallet.app/',
    installLinks: {
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/subwallet-polkadot-extens/onhogfjeacnfoofkfgppdlbmlmnplgbn',
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/firefox/addon/subwallet/',
    },
  },
};
