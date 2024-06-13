'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ConnectWalletMobileButton } from '@webb-tools/webb-ui-components/components/ConnectWalletMobileButton';
import { useCheckMobile } from '@webb-tools/webb-ui-components/hooks/useCheckMobile';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Link from 'next/link';

export default function ActionButton() {
  const { isMobile } = useCheckMobile();

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

  return <Button isFullWidth>Deposit</Button>;
}
