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
} from '@webb-tools/icons/wallets';
import { metaMask, walletConnect } from 'wagmi/connectors';
import getPolkadotBasedWallet from '../utils/getPolkadotBasedWallet';
import wagmiConfig from '../wagmi-config';
import rainbow from './connectors/rainbow';
import type { WalletConfig } from './wallet-config.interface';

const ANY_EVM = [
  PresetTypedChainId.EthereumMainNet,
  PresetTypedChainId.TangleMainnetEVM,

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
  PresetTypedChainId.TangleTestnetEVM,

  // Localnet
  PresetTypedChainId.HermesLocalnet,
  PresetTypedChainId.AthenaLocalnet,
  PresetTypedChainId.DemeterLocalnet,
];

const ANY_SUBSTRATE = [
  PresetTypedChainId.TangleMainnetNative,
  PresetTypedChainId.TangleTestnetNative,
  PresetTypedChainId.Kusama,
  PresetTypedChainId.Polkadot,
];

export const connectors = {
  [WalletId.MetaMask]: wagmiConfig._internal.connectors.setup(
    metaMask({
      dappMetadata: {
        name: process.env['DAPP_NAME'] ?? 'dApp',
        url: process.env['DAPP_URL'],
      },
    }),
  ),
  [WalletId.WalletConnectV2]: wagmiConfig._internal.connectors.setup(
    walletConnect({
      projectId: process.env['BRIDGE_DAPP_WALLET_CONNECT_PROJECT_ID'] ?? '',
    }),
  ),
  [WalletId.Rainbow]: wagmiConfig._internal.connectors.setup(rainbow()),
} as const;

export const walletsConfig: Record<number, WalletConfig> = {
  // TODO: Should move all hardcoded wallet configs to connectors
  // https://wagmi.sh/examples/custom-connector
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: <MetaMaskIcon />,
    name: 'MetaMask',
    title: 'MetaMask',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return connectors[WalletId.MetaMask];
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
    name: 'WalletConnect',
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
    name: 'Rainbow',
    title: 'Rainbow',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return connectors[WalletId.Rainbow];
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
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    Logo: <PolkadotJsIcon />,
    name: 'polkadot-js',
    title: `Polkadot{.js}`,
    platform: 'Substrate',
    enabled: true,
    async detect(appName) {
      return getPolkadotBasedWallet(appName, 'polkadot-js');
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
  [WalletId.Talisman]: {
    id: WalletId.Talisman,
    Logo: <TalismanIcon />,
    name: 'talisman',
    title: 'Talisman',
    platform: 'Substrate',
    enabled: true,
    detect(appName) {
      return getPolkadotBasedWallet(appName, 'talisman');
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
    detect(appName) {
      return getPolkadotBasedWallet(appName, 'subwallet-js');
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
