'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import Link from 'next/link';

export default function DepositButton() {
  return (
    <Button as={Link} href="deposit" variant="link" size="md">
      Deposit now!
    </Button>
  );
}
