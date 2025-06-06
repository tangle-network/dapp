import { SupportedBrowsers } from '@tangle-network/browser-utils/platform';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { WalletId } from '@tangle-network/dapp-types/WalletId';
import {
  MetaMaskIcon,
  PhantomWalletIcon,
  PolkadotJsIcon,
  RainbowIcon,
  SubWalletIcon,
  TalismanIcon,
  WalletConnectIcon,
} from '@tangle-network/icons/wallets';
import type { WalletConfig } from './wallet-config.interface';

// Remove this!
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
  }
}

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

const ANY_SUBSTRATE = [
  PresetTypedChainId.TangleMainnetNative,
  PresetTypedChainId.TangleTestnetNative,
  PresetTypedChainId.TangleLocalNative,
  PresetTypedChainId.Kusama,
  PresetTypedChainId.Polkadot,
  PresetTypedChainId.RococoPhala,
];

const ANY_SOLANA = [
  PresetTypedChainId.SolanaMainnet,
  PresetTypedChainId.SolanaTestnet,
  PresetTypedChainId.SolanaDevnet,
];

const detectSubstrateWallet = (walletName: string) => {
  const extension = window.injectedWeb3?.[walletName];
  if (extension === undefined) {
    return;
  }

  if (extension.connect === undefined && extension.enable === undefined) {
    return;
  }

  return extension;
};

const detectPhantomWallet = async (): Promise<boolean> => {
  try {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      return !!provider?.isPhantom;
    }
    return false;
  } catch (error) {
    console.error('Error detecting Phantom wallet:', error);
    return false;
  }
};

export const WALLET_CONFIG: Record<WalletId, WalletConfig> = {
  // TODO: Should move all hardcoded wallet configs to connectors
  // https://wagmi.sh/examples/custom-connector
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
    platform: 'EVM',
    enabled: false,
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
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    Logo: <PolkadotJsIcon />,
    name: 'polkadot-js',
    title: `Polkadot{.js}`,
    platform: 'Substrate',
    enabled: true,
    async detect() {
      return detectSubstrateWallet('polkadot-js');
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
    async detect() {
      return detectSubstrateWallet('talisman');
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
    async detect() {
      return detectSubstrateWallet('subwallet-js');
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
  [WalletId.Phantom]: {
    id: WalletId.Phantom,
    Logo: <PhantomWalletIcon />,
    name: 'Phantom',
    title: 'Phantom',
    platform: 'Solana',
    enabled: true,
    async detect() {
      return await detectPhantomWallet();
    },
    supportedChainIds: [...ANY_SOLANA],
    homeLink: 'https://phantom.com/',
    installLinks: {
      [SupportedBrowsers.Chrome]:
        'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
      [SupportedBrowsers.FireFox]:
        'https://addons.mozilla.org/en-CA/firefox/addon/phantom-app/',
    },
  },
};
