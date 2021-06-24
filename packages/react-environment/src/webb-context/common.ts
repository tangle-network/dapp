import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';
import { CurrencyConfig } from '@webb-dapp/react-environment/types/currency';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
};
export type Wallet = WalletConfig & {};

export type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
  currencies: Record<number, CurrencyConfig>;
};
