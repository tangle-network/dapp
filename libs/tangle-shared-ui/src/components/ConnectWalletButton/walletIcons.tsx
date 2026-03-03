import {
  CoinbaseIcon,
  MetaMaskIcon,
  RainbowIcon,
  SafeIcon,
  TalismanIcon,
  TrustWalletIcon,
  WalletConnectIcon,
} from '@tangle-network/icons/wallets';
import { WalletLineIcon } from '@tangle-network/icons';
import { ReactElement } from 'react';

/**
 * Get wallet icon based on connector ID or name
 */
export const getWalletIcon = (
  connectorId?: string,
  connectorName?: string,
): ReactElement => {
  const id = connectorId?.toLowerCase() ?? '';
  const name = connectorName?.toLowerCase() ?? '';

  // Match by connector ID first
  if (id.includes('metamask') || name.includes('metamask')) {
    return <MetaMaskIcon size="lg" />;
  }

  if (id.includes('coinbase') || name.includes('coinbase')) {
    return <CoinbaseIcon size="lg" />;
  }

  if (id.includes('walletconnect') || name.includes('walletconnect')) {
    return <WalletConnectIcon size="lg" />;
  }

  if (id.includes('rainbow') || name.includes('rainbow')) {
    return <RainbowIcon size="lg" />;
  }

  if (id.includes('safe') || name.includes('safe') || name.includes('gnosis')) {
    return <SafeIcon size="lg" />;
  }

  if (id.includes('talisman') || name.includes('talisman')) {
    return <TalismanIcon size="lg" />;
  }

  if (id.includes('trust') || name.includes('trust')) {
    return <TrustWalletIcon size="lg" />;
  }

  // Default wallet icon
  return <WalletLineIcon size="lg" />;
};
