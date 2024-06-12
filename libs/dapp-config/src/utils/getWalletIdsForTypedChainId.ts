import type { WalletConfig } from '../wallets/wallet-config.interface';
import { walletsConfig as defaultWalletConfig } from '../wallets/wallets-config';

export default function getWalletIdsForTypedChainId(
  typedChainId: number,
  walletsConfig: Record<number, WalletConfig> = defaultWalletConfig,
): Array<WalletConfig['id']> {
  return Array.from(
    Object.values(walletsConfig)
      .filter(({ supportedChainIds }) =>
        supportedChainIds.includes(typedChainId),
      )
      .reduce(
        (acc, walletsConfig) => {
          acc.add(walletsConfig.id);
          return acc;
        },
        // Use a Set to avoid duplicates
        new Set<WalletConfig['id']>(),
      )
      .values(),
  );
}
