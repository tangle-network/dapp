'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Divider,
  notificationApi,
} from '@webb-tools/webb-ui-components';
import {
  SOCIAL_URLS_RECORD,
  WEBB_FAUCET_URL,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Link from 'next/link';
import { type FC, useEffect, useMemo, useState } from 'react';
import React from 'react';

import { NominatorStatsItem } from '../../components';
import { isNominatorFirstTimeNominator } from '../../constants';
import useUnbondingRemainingErasSubscription from '../../data/NominatorStats/useUnbondingRemainingErasSubscription';
import { convertToSubstrateAddress } from '../../utils';
import { BondMoreTxContainer } from '../BondMoreTxContainer';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { RebondTxContainer } from '../RebondTxContainer';
import { UnbondTxContainer } from '../UnbondTxContainer';
import { WithdrawUnbondedTxContainer } from '../WithdrawUnbondedTxContainer';

export const NominatorStatsContainer: FC = () => {
  const { activeAccount } = useWebContext();

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isBondMoreModalOpen, setIsBondMoreModalOpen] = useState(false);
  const [isUnbondModalOpen, setIsUnbondModalOpen] = useState(false);
  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);
  const [isWithdrawUnbondedModalOpen, setIsWithdrawunbondedModalOpen] =
    useState(false);
  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    data: unbondingRemainingErasData,
    error: unbondingRemainingErasError,
  } = useUnbondingRemainingErasSubscription(substrateAddress);

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

  const unbondingRemainingErasTooltip = useMemo(() => {
    if (unbondingRemainingErasError) {
      notificationApi({
        variant: 'error',
        message: unbondingRemainingErasError.message,
      });
    }

    if (!unbondingRemainingErasData?.value1) return null;

    if (unbondingRemainingErasData.value1.length === 0) {
      return 'You have no unbonding tokens.';
    }

    const elements = unbondingRemainingErasData.value1.map((era, index) => (
      <React.Fragment key={index}>
        <div className="text-center mb-2">
          <p>
            {era.remainingEras > 0 ? 'Unbonding' : 'Unbonded'} {era.amount}
          </p>
          {era.remainingEras > 0 && <p>{era.remainingEras} eras remaining</p>}
        </div>
      </React.Fragment>
    ));

    return <>{elements}</>;
  }, [unbondingRemainingErasError, unbondingRemainingErasData?.value1]);

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
            <Link href={WEBB_FAUCET_URL} target="_blank">
              <Button variant="utility" className="w-full">
                Get tTNT
              </Button>
            </Link>

            {isFirstTimeNominator && (
              <Button
                variant="utility"
                className="w-full"
                isDisabled={!activeAccount}
                onClick={() => setIsDelegateModalOpen(true)}
              >
                Nominate
              </Button>
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

            <NominatorStatsItem
              title="Unbonding tTNT"
              tooltip={unbondingRemainingErasTooltip}
              type="Unbonding Amount"
              address={substrateAddress}
            />
          </div>

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {!isFirstTimeNominator ? (
                <>
                  <Button
                    variant="utility"
                    className="w-full"
                    isDisabled={!activeAccount}
                    onClick={() => setIsBondMoreModalOpen(true)}
                  >
                    Add Stake
                  </Button>

                  <Button
                    variant="utility"
                    className="w-full"
                    isDisabled={!activeAccount}
                    onClick={() => setIsUnbondModalOpen(true)}
                  >
                    Unbond
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!isFirstTimeNominator && (
                <>
                  <Button
                    variant="utility"
                    className="w-full"
                    isDisabled={!activeAccount}
                    onClick={() => setIsRebondModalOpen(true)}
                  >
                    Rebond
                  </Button>

                  <Button
                    variant="utility"
                    className="w-full"
                    isDisabled={!activeAccount}
                    onClick={() => setIsWithdrawunbondedModalOpen(true)}
                  >
                    Withdraw
                  </Button>
                </>
              )}
            </div>
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

      <UnbondTxContainer
        isModalOpen={isUnbondModalOpen}
        setIsModalOpen={setIsUnbondModalOpen}
      />

      <RebondTxContainer
        isModalOpen={isRebondModalOpen}
        setIsModalOpen={setIsRebondModalOpen}
      />

      <WithdrawUnbondedTxContainer
        isModalOpen={isWithdrawUnbondedModalOpen}
        setIsModalOpen={setIsWithdrawunbondedModalOpen}
      />
    </>
  );
};
