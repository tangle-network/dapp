import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import { WalletId } from '../wallets/wallet-id.enum';
import { PolkaLogo } from '@webb-dapp/apps/configs/logos/PolkaLogo';
import { MetaMaskLogo } from '@webb-dapp/apps/configs/logos/MetaMaskLogo';
import { ChainId } from '../chains/chain-id.enum';
import { WalletConnectLogo } from '@webb-dapp/apps/configs/logos/WalletConnectLogo';

const ANY_EVM = [
  ChainId.Edgeware,
  ChainId.EdgewareTestNet,
  ChainId.EthereumMainNet,
  ChainId.Rinkeby,
  ChainId.Kovan,
  ChainId.Ropsten,
  ChainId.Goerli,
  ChainId.HarmonyTestnet1,
];
export const walletsConfig: AppConfig['wallet'] = {
  [WalletId.Polkadot]: {
    id: WalletId.Polkadot,
    logo: PolkaLogo,
    name: 'polkadot-js',
    title: `Polkadot`,
    platform: 'Substrate',
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [ChainId.Edgeware, ChainId.EdgewareTestNet, ChainId.EdgewareLocalNet],
  },
  [WalletId.MetaMask]: {
    id: WalletId.MetaMask,
    logo: MetaMaskLogo,
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
  },
  3: {
    id: 3,
    logo: WalletConnectLogo,
    name: 'wallet connect',
    title: `Wallet Connect`,
    platform: 'EVM',
    enabled: true,
    detect() {
      return true;
    },
    supportedChainIds: [...ANY_EVM],
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
};
