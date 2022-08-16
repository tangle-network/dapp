import { AppConfig, PresetTypedChainId } from '@webb-dapp/api-providers';
import { MetaMaskLogo } from '@webb-dapp/apps/configs/logos/MetaMaskLogo';
import { PolkaLogo } from '@webb-dapp/apps/configs/logos/PolkaLogo';
import { WalletConnectLogo } from '@webb-dapp/apps/configs/logos/WalletConnectLogo';
import { TalismanLogo } from '@webb-dapp/apps/configs/logos/wallets';
import { SupportedBrowsers } from '@webb-dapp/utils/platform';

import { WalletId } from '../wallets/wallet-id.enum';

const ANY_EVM = [
  PresetTypedChainId.EthereumMainNet,
  PresetTypedChainId.Rinkeby,
  PresetTypedChainId.Kovan,
  PresetTypedChainId.Ropsten,
  PresetTypedChainId.Goerli,
  PresetTypedChainId.HarmonyTestnet1,
  PresetTypedChainId.HarmonyTestnet0,
  PresetTypedChainId.HarmonyMainnet0,
  PresetTypedChainId.Shiden,
  PresetTypedChainId.OptimismTestnet,
  PresetTypedChainId.ArbitrumTestnet,
  PresetTypedChainId.PolygonTestnet,
  PresetTypedChainId.HermesLocalnet,
  PresetTypedChainId.AthenaLocalnet,
  PresetTypedChainId.DemeterLocalnet,
  PresetTypedChainId.MoonbaseAlpha,
];

const ANY_SUBSTRATE = [
  PresetTypedChainId.EggStandalone,
  PresetTypedChainId.EggDevelopStandalone,
  PresetTypedChainId.DkgSubstrateStandalone,
  PresetTypedChainId.ProtocolSubstrateStandalone,
  PresetTypedChainId.Kusama,
  PresetTypedChainId.Polkadot,
];

export const walletsConfig: AppConfig['wallet'] = {
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    Logo: PolkaLogo,
    name: 'polkadot-js',
    title: `PolkadotJS Extension`,
    platform: 'Substrate',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [...ANY_SUBSTRATE],
    homeLink: 'https://polkadot.js.org/extension',
    installLinks: {
      [SupportedBrowsers.FireFox]: 'https://addons.mozilla.org/firefox/addon/polkadot-js-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
    },
  },
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    Logo: MetaMaskLogo,
    name: 'metamask',
    title: `MetaMask`,
    platform: 'EVM',
    enabled: true,
    detect() {
      const hasWeb3 = typeof (window as any).web3 !== 'undefined';
      if (hasWeb3) {
        return (window as any).web3.__isMetaMaskShim__ as boolean;
      }
      return false;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://metamask.io/',
    installLinks: {
      [SupportedBrowsers.FireFox]: 'https://addons.mozilla.org/firefox/addon/ether-metamask/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
    },
  },
  [WalletId.WalletConnectV1]: {
    id: WalletId.WalletConnectV1,
    Logo: WalletConnectLogo,
    name: 'wallet connect',
    title: `Wallet Connect`,
    platform: 'EVM',
    enabled: true,
    detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
    homeLink: 'https://walletconnect.com/',
  },
  // [WalletId.OneWallet]: {
  //   id: WalletId.OneWallet,
  //   logo: HarmonyLogo,
  //   name: 'one wallet',
  //   title: 'One',
  //   enabled: true,
  //   detect() {
  //     const hasOneWallet = typeof (window as any).onewallet !== 'undefined';
  //     if (hasOneWallet) {
  //       return (window as any).onewallet.isOneWallet as boolean;
  //     }
  //     return false;
  //   },
  //   supportedChainIds: [ChainId.HarmonyTestnet1],
  // },
  [WalletId.Talisman]: {
    id: WalletId.Talisman,
    Logo: TalismanLogo,
    name: 'talisman',
    title: 'Talisman',
    platform: 'Substrate',
    enabled: true,
    detect() {
      return true;
    },
    supportedChainIds: [...ANY_SUBSTRATE],
    homeLink: 'https://talisman.xyz/',
    installLinks: {
      [SupportedBrowsers.FireFox]: 'https://addons.mozilla.org/firefox/addon/talisman-wallet-extension/',
      [SupportedBrowsers.Chrome]:
        'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
    },
  },
};
