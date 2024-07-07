import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ConnectWalletMobileButton } from '@webb-tools/webb-ui-components/components/ConnectWalletMobileButton';
import { useCheckMobile } from '@webb-tools/webb-ui-components/hooks/useCheckMobile';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';
import { type ReactNode, useMemo } from 'react';

type Props = {
  targetTypedChainId?: number;
  children: (isLoading: boolean, loadingText?: string) => ReactNode;
};

export default function ActionButtonBase({
  targetTypedChainId,
  children,
}: Props) {
  const { isMobile } = useCheckMobile();
  const { loading, isConnecting, activeWallet } = useWebContext();
  const { toggleModal } = useConnectWallet();

  const { isLoading, loadingText } = useMemo(() => {
    if (loading)
      return {
        isLoading: true,
        loadingText: 'Loading...',
      };

    if (isConnecting)
      return {
        isLoading: true,
        loadingText: 'Connecting...',
      };

    return {
      isLoading: false,
    };
  }, [isConnecting, loading]);

  if (isMobile) {
    return (
      <ConnectWalletMobileButton title="Try Hubble on Desktop" isFullWidth>
        <Typography variant="body1">
          A complete mobile experience for Hubble Bridge is in the works. For
          now, enjoy all features on a desktop device.
        </Typography>
        <Typography variant="body1">
          Visit the link on desktop below to start transacting privately!
        </Typography>
        <Button as={Link} href="deposit" variant="link">
          {window.location.href}
        </Button>
      </ConnectWalletMobileButton>
    );
  }

  // If the user is not connected to a wallet, show the connect wallet button
  if (activeWallet === undefined) {
    return (
      <Button
        type="button"
        isFullWidth
        isLoading={isLoading}
        loadingText={loadingText}
        onClick={() => toggleModal(true, targetTypedChainId)}
      >
        Connect Wallet
      </Button>
    );
  }

  return children(isLoading, loadingText);
}
