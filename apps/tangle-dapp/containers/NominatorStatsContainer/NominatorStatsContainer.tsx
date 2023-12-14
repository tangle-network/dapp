'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Divider,
  notificationApi,
} from '@webb-tools/webb-ui-components';
import {
  SOCIAL_URLS_RECORD,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Link from 'next/link';
import { type FC, useEffect, useMemo, useState } from 'react';

import { NominatorStatsItem } from '../../components';
import { isNominatorFirstTimeNominator } from '../../constants';
import { convertEthereumToSubstrateAddress } from '../../utils';
import { BondMoreTxContainer } from '../BondMoreTxContainer';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { UpdatePayeeTxContainer } from '../UpdatePayeeTxContainer';

export const NominatorStatsContainer: FC = () => {
  const { activeAccount } = useWebContext();

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isBondMoreModalOpen, setIsBondMoreModalOpen] = useState(false);
  const [isUpdatePayeeModalOpen, setIsUpdatePayeeModalOpen] = useState(false);
  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  useEffect(() => {
    try {
      const checkIfFirstTimeNominator = async () => {
        const isFirstTimeNominator = await isNominatorFirstTimeNominator(
          substrateAddress
        );

        setIsFirstTimeNominator(isFirstTimeNominator);
      };

      if (substrateAddress) {
        checkIfFirstTimeNominator();
      }
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message:
          error.message ||
          'Failed to check if the user is a first time nominator.',
      });
    }
  }, [substrateAddress]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div
          className={cx(
            'w-full rounded-2xl overflow-hidden h-min-[204px] p-4',
            'bg-glass dark:bg-glass_dark',
            'border-2 border-mono-0 dark:border-mono-160'
          )}
        >
          <NominatorStatsItem
            title="Available tTNT in Wallet"
            type="Wallet Balance"
            address={walletAddress}
          />

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="utility"
              className="w-full"
              isDisabled={!activeAccount}
              onClick={() => setIsDelegateModalOpen(true)}
            >
              {isFirstTimeNominator ? 'Nominate' : 'Update Nominations'}
            </Button>

            {!isFirstTimeNominator && (
              <>
                <Button
                  variant="utility"
                  className="w-full"
                  isDisabled={!activeAccount}
                  onClick={() => setIsBondMoreModalOpen(true)}
                >
                  Bond More
                </Button>

                <Button
                  variant="utility"
                  className="w-full"
                  isDisabled={!activeAccount}
                  onClick={() => setIsUpdatePayeeModalOpen(true)}
                >
                  Change Reward Destination
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          className={cx(
            'w-full rounded-2xl overflow-hidden h-min-[204px] p-4',
            'bg-glass dark:bg-glass_dark',
            'border-2 border-mono-0 dark:border-mono-160'
          )}
        >
          <div className="grid grid-cols-2 gap-2">
            <NominatorStatsItem
              title="Total Staked tTNT"
              tooltip="Total Staked tTNT (bonded)."
              type="Total Staked"
              address={substrateAddress}
            />

            {!isFirstTimeNominator && (
              <NominatorStatsItem
                title="Reward Destination"
                tooltip="The address that will receive your rewards."
                type="Payment Destination"
                address={substrateAddress}
              />
            )}
          </div>

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="flex items-center gap-2 flex-wrap">
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

      <DelegateTxContainer
        isModalOpen={isDelegateModalOpen}
        setIsModalOpen={setIsDelegateModalOpen}
      />

      <BondMoreTxContainer
        isModalOpen={isBondMoreModalOpen}
        setIsModalOpen={setIsBondMoreModalOpen}
      />

      <UpdatePayeeTxContainer
        isModalOpen={isUpdatePayeeModalOpen}
        setIsModalOpen={setIsUpdatePayeeModalOpen}
      />
    </>
  );
};
