'use client';

import {
  ArrowLeftRightLineIcon,
  CoinsLineIcon,
  CoinsStackedLineIcon,
  GiftLineIcon,
  ShieldKeyholeLineIcon,
  StatusIndicator,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC, ReactElement, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useNetworkStore from '../../context/useNetworkStore';
import useAirdropEligibility from '../../data/claims/useAirdropEligibility';
import usePayoutsAvailability from '../../data/Payouts/usePayoutsAvailability';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { InternalPath, PagePath, StaticSearchQueryPath } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';

const Actions: FC = () => {
  const { nativeTokenSymbol } = useNetworkStore();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();
  const { isEligible: isAirdropEligible } = useAirdropEligibility();
  const isPayoutsAvailable = usePayoutsAvailability();

  const {
    isVesting,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableAmount: claimableTokenAmount,
  } = useVestingInfo();

  const formattedClaimableTokenAmount =
    claimableTokenAmount !== null
      ? formatTokenBalance(claimableTokenAmount, nativeTokenSymbol)
      : null;

  return (
    <>
      <div className="flex items-center justify-start gap-6 overflow-x-auto">
        <ActionItem
          label="Transfer"
          Icon={ArrowLeftRightLineIcon}
          onClick={() => setIsTransferModalOpen(true)}
        />

        <ActionItem
          label="Nominate"
          internalHref={StaticSearchQueryPath.NominationsTable}
          Icon={CoinsStackedLineIcon}
        />

        {isPayoutsAvailable && (
          <ActionItem
            hasNotificationDot
            label="Payouts"
            Icon={CoinsLineIcon}
            internalHref={StaticSearchQueryPath.PayoutsTable}
            tooltip="You have payouts available. Click here to visit the Payouts page."
          />
        )}

        {isAirdropEligible && (
          <ActionItem
            label="Claim Airdrop"
            hasNotificationDot
            Icon={GiftLineIcon}
            internalHref={PagePath.CLAIM_AIRDROP}
            tooltip={
              <>
                Congratulations, you are eligible for the Tangle Network
                airdrop! Click here to visit the <strong>Claim Airdrop</strong>{' '}
                page.
              </>
            }
          />
        )}

        {/* This is a special case, so hide it for most users if they're not vesting */}
        {isVesting && (
          <ActionItem
            Icon={ShieldKeyholeLineIcon}
            label="Vest"
            onClick={executeVestTx !== null ? executeVestTx : undefined}
            hasNotificationDot={hasClaimableVestingTokens}
            isDisabled={
              vestTxStatus === TxStatus.PROCESSING ||
              !hasClaimableVestingTokens ||
              executeVestTx === null
            }
            tooltip={
              hasClaimableVestingTokens ? (
                <>
                  There are <strong>{formattedClaimableTokenAmount}</strong>{' '}
                  vested tokens that are ready to be claimed. Use this action to
                  release them.
                </>
              ) : (
                <>
                  There are vesting schedules in your account, but no tokens
                  have vested yet.
                </>
              )
            }
          />
        )}
      </div>

      {/* TODO: Might be better to use a hook instead of doing it this way. */}
      <div className="!m-0">
        <TransferTxContainer
          isModalOpen={isTransferModalOpen}
          setIsModalOpen={setIsTransferModalOpen}
        />
      </div>
    </>
  );
};

/** @internal */
const ActionItem = (props: {
  Icon: (props: IconBase) => ReactElement;
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
  hasNotificationDot?: boolean;
  internalHref?: InternalPath;
  tooltip?: ReactElement | string;
}) => {
  const {
    Icon,
    label,
    onClick,
    internalHref,
    tooltip,
    isDisabled = false,
    hasNotificationDot = false,
  } = props;

  const handleClick = useCallback(() => {
    if (isDisabled || onClick === undefined) {
      return;
    }

    onClick();
  }, [isDisabled, onClick]);

  const content = (
    <div
      className={twMerge(
        'inline-flex flex-col justify-center items-center gap-2',
        isDisabled && 'opacity-50'
      )}
    >
      <div
        onClick={handleClick}
        className={twMerge(
          'inline-flex mx-auto items-center justify-center relative p-2 rounded-lg hover:bg-mono-20 dark:hover:bg-mono-160 text-mono-200 dark:text-mono-0',
          isDisabled ? '!cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {/* Notification dot */}
        {hasNotificationDot && (
          <StatusIndicator
            variant="success"
            size={12}
            className="absolute right-0 top-0"
          />
        )}

        <Icon size="lg" />
      </div>

      <Typography
        component="span"
        variant="body1"
        className="block text-center dark:text-mono-0"
      >
        {label}
      </Typography>
    </div>
  );

  const withLink =
    internalHref !== undefined ? (
      <Link href={internalHref}>{content}</Link>
    ) : (
      content
    );

  return tooltip !== undefined ? (
    <Tooltip>
      <TooltipBody className="break-normal max-w-[250px] text-center">
        {tooltip}
      </TooltipBody>

      <TooltipTrigger asChild>{withLink}</TooltipTrigger>
    </Tooltip>
  ) : (
    withLink
  );
};

export default Actions;
