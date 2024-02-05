'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import { Button, Divider } from '@webb-tools/webb-ui-components';
import {
  SOCIAL_URLS_RECORD,
  WEBB_FAUCET_URL,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Link from 'next/link';
import { type FC, useMemo, useState } from 'react';
import React from 'react';

import { NominatorStatsItem, UnbondingStatsItem } from '../../components';
import { TOKEN_UNIT } from '../../constants';
import useIsFirstTimeNominatorSubscription from '../../hooks/useIsFirstTimeNominatorSubscription';
import { convertToSubstrateAddress } from '../../utils';
import { BondMoreTxContainer } from '../BondMoreTxContainer';
import { DelegateTxContainer } from '../DelegateTxContainer';
import { RebondTxContainer } from '../RebondTxContainer';
import { UnbondTxContainer } from '../UnbondTxContainer';
import { WithdrawUnbondedTxContainer } from '../WithdrawUnbondedTxContainer';

const NominatorStatsContainer: FC = () => {
  const { activeAccount } = useWebContext();

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isBondMoreModalOpen, setIsBondMoreModalOpen] = useState(false);
  const [isUnbondModalOpen, setIsUnbondModalOpen] = useState(false);
  const [isRebondModalOpen, setIsRebondModalOpen] = useState(false);
  const [isWithdrawUnbondedModalOpen, setIsWithdrawunbondedModalOpen] =
    useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  const {
    isFirstTimeNominator,
    isFirstTimeNominatorLoading,
    isFirstTimeNominatorError,
  } = useIsFirstTimeNominatorSubscription(substrateAddress);

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
            title={`Available ${TOKEN_UNIT} in Wallet`}
            type="Wallet Balance"
            address={walletAddress}
          />

          <Divider className="my-6 bg-mono-0 dark:bg-mono-160" />

          <div className="flex items-center gap-2 flex-wrap">
            <Link href={WEBB_FAUCET_URL} target="_blank">
              <Button variant="utility" className="w-full">
                {`Get ${TOKEN_UNIT}`}
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
              title={`Total Staked ${TOKEN_UNIT}`}
              tooltip={`Total Staked ${TOKEN_UNIT} (bonded).`}
              type="Total Staked"
              address={substrateAddress}
            />

            <UnbondingStatsItem address={substrateAddress} />
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
              {isFirstTimeNominator === false &&
                !isFirstTimeNominatorLoading &&
                !isFirstTimeNominatorError && (
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

export default NominatorStatsContainer;
