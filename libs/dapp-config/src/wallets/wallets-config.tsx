import { SupportedBrowsers } from '@tangle-network/browser-utils/platform';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { WalletId } from '@tangle-network/dapp-types/WalletId';
import {
  CoinbaseIcon,
  KeplrIcon,
  MetaMaskIcon,
  RainbowIcon,
  SafeIcon,
  TalismanIcon,
  TrustWalletIcon,
  WalletConnectIcon,
} from '@tangle-network/icons/wallets';
import type { WalletConfig } from './wallet-config.interface';

const ANY_EVM = [
  PresetTypedChainId.EthereumMainNet,
  PresetTypedChainId.TangleMainnetEVM,

  PresetTypedChainId.Arbitrum,
  PresetTypedChainId.Base,
  PresetTypedChainId.BSC,
  PresetTypedChainId.Linea,
  PresetTypedChainId.Optimism,
  PresetTypedChainId.Polygon,

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
  PresetTypedChainId.ScrollSepolia,
  PresetTypedChainId.TangleTestnetEVM,
  PresetTypedChainId.Holesky,

  // Localnet
  PresetTypedChainId.TangleLocalEVM,
  PresetTypedChainId.HermesLocalnet,
  PresetTypedChainId.AthenaLocalnet,
  PresetTypedChainId.DemeterLocalnet,
];

export const WALLET_CONFIG: Record<WalletId, WalletConfig> = {
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: <MetaMaskIcon />,
    name: 'MetaMask',
    title: 'MetaMask',
    rdns: 'io.metamask',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://metamask.io/',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/firefox/addon/ether-metamask/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
    },
  },
  [WalletId.WalletConnectV2]: {
    id: WalletId.WalletConnectV2,
    Logo: <WalletConnectIcon />,
    name: 'WalletConnect',
    title: 'WalletConnect',
    rdns: 'walletConnect',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://walletconnect.com/',
  },
  [WalletId.Rainbow]: {
    id: WalletId.Rainbow,
    Logo: <RainbowIcon />,
    name: 'Rainbow',
    title: 'Rainbow',
    rdns: 'me.rainbow',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://rainbow.me/',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/rainbow-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/rainbow/opfgelmcmbiajamepnmloijbpoleiama',
    },
  },
  [WalletId.Coinbase]: {
    id: WalletId.Coinbase,
    Logo: <CoinbaseIcon />,
    name: 'Coinbase Wallet',
    title: 'Coinbase Wallet',
    rdns: 'com.coinbase.wallet',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://www.coinbase.com/wallet',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/coinbase-wallet-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
    },
  },
  [WalletId.Safe]: {
    id: WalletId.Safe,
    Logo: <SafeIcon />,
    name: 'Safe',
    title: 'Safe Wallet',
    rdns: 'safe',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://safe.global/',
  },
  [WalletId.Talisman]: {
    id: WalletId.Talisman,
    Logo: <TalismanIcon />,
    name: 'Talisman',
    title: 'Talisman',
    rdns: 'xyz.talisman',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://talisman.xyz/',
    installLinks: {
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/talisman-wallet-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    },
  },
  [WalletId.TrustWallet]: {
    id: WalletId.TrustWallet,
    Logo: <TrustWalletIcon />,
    name: 'Trust Wallet',
    title: 'Trust Wallet',
    rdns: 'com.trustwallet.app',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://trustwallet.com/',
    installLinks: {
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph',
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/trust-wallet/',
    },
  },
  [WalletId.Keplr]: {
    id: WalletId.Keplr,
    Logo: <KeplrIcon />,
    name: 'Keplr',
    title: 'Keplr',
    rdns: 'app.keplr',
    platform: 'EVM',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://www.keplr.app/',
    installLinks: {
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-US/firefox/addon/keplr/',
    },
  },
};
