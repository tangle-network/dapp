'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { Button, Divider } from '@webb-tools/webb-ui-components';
import {
  SOCIAL_URLS_RECORD,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Link from 'next/link';
import { useMemo } from 'react';

import { NominatorStatsItem } from '../../components';
import { convertEthereumToSubstrateAddress } from '../../utils';

export const NominatorStatsContainer = () => {
  const { activeAccount } = useWebContext();

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div
        className={cx(
          'w-full rounded-2xl overflow-hidden h-[204px] p-4',
          'bg-glass dark:bg-glass_dark',
          'border-2 border-mono-0 dark:border-mono-160'
        )}
      >
        <NominatorStatsItem
          title="Available tTNT in Wallet"
          address={walletAddress}
          type="Wallet Balance"
        />

        <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

        <Button variant="utility" className="w-full" isDisabled>
          Delegate
        </Button>
      </div>

      <div
        className={cx(
          'w-full rounded-2xl overflow-hidden h-[204px] p-4',
          'bg-glass dark:bg-glass_dark',
          'border-2 border-mono-0 dark:border-mono-160'
        )}
      >
        <NominatorStatsItem
          title="Total Staked tTNT"
          tooltip="Total Staked tTNT."
          address={substrateAddress}
          type="Total Staked"
        />

        <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

        <div className="flex items-center gap-2">
          <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
            <Button variant="utility" className="w-full">
              Learn More
            </Button>
          </Link>

          <Link href={SOCIAL_URLS_RECORD.discord} target="_blank">
            <Button variant="utility" className="w-full">
              Join Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
