import { AppConfig } from '@webb-dapp/react-environment/webb-context';
import { PolkaLogo } from '@webb-dapp/apps/configs/wallets/logos/PolkaLogo';
import { MetaMaskLogo } from '@webb-dapp/apps/configs/wallets/logos/MetaMaskLogo';
import { WalletConnectLogo } from '@webb-dapp/apps/configs/wallets/logos/WalletConnectLogo';

export enum WalletsIds {
  Polkadot = 1,
  MetaMask,
  WalletConnect,
}

export const walletsConfig: AppConfig['wallet'] = {
  1: {
    id: 1,
    logo: PolkaLogo,
    name: 'polkadot-js',
    title: `Polkadot`,
    enabled: true,
    async detect() {
      return true;
    },
    supportedChainIds: [1, 2, 3],
  },
  2: {
    id: 2,
    logo: MetaMaskLogo,
    name: 'metamask',
    title: `MetaMask`,
    enabled: true,
    detect() {
      const hasWeb3 = typeof (window as any).web3 !== 'undefined';
      if (hasWeb3) {
        return (window as any).web3.__isMetaMaskShim__ as boolean;
      }
      return false;
    },
    supportedChainIds: [1, 2, 3, 4],
  },
  // 3: {
  //   id: 3,
  //   logo: WalletConnectLogo,
  //   name: 'wallet connect',
  //   title: `Wallet Connect`,
  //   enabled: true,
  //   detect() {
  //     return true;
  //   },
  //   supportedChainIds: [1, 2, 3, 4],
  // },
};
