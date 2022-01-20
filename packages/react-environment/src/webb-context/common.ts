import { ChainConfig } from '@webb-dapp/react-environment/types/chain-config.interface';
import { CurrencyConfig } from '@webb-dapp/react-environment/types/currency-config.interface';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
};
export type Wallet = WalletConfig & {};

export type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
  currencies: Record<number, CurrencyConfig>;
  bridgeByAsset: Record<number, BridgeConfig>;
};
