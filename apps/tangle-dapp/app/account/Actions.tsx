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
import useAirdropEligibility from '../../data/claims/useAirdropEligibility';
import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { AnchorPath, InternalPath, PagePath } from '../../types';
import { formatTokenBalance } from '../../utils/polkadot';

type ActionItemDef = {
  label: string;
  internalHref: InternalPath;
  icon: ReactElement<IconBase>;
};

/** @internal */
const staticActionItems: ActionItemDef[] = [
  {
    label: 'Nominate',
    internalHref: AnchorPath.NominationAndPayouts,
    icon: <CoinsStackedLineIcon size="lg" />,
  },
  {
    label: 'Payouts',
    internalHref: AnchorPath.NominationAndPayouts,
    icon: <CoinsLineIcon size="lg" />,
  },
] as const;

const Actions: FC = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const {
    isVesting,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableTokenAmount,
  } = useVestingInfo();

  const { execute: executeVestTx, status: vestTxStatus } = useVestTx(true);

  const formattedClaimableTokenAmount =
    claimableTokenAmount !== null
      ? formatTokenBalance(claimableTokenAmount)
      : null;

  const { isAirdropEligible } = useAirdropEligibility();

  return (
    <>
      <div className="flex items-center justify-start gap-6 overflow-x-auto">
        <ActionItem
          icon={<ArrowLeftRightLineIcon size="lg" />}
          label="Transfer"
          onClick={() => setIsTransferModalOpen(true)}
        />

        {staticActionItems.map((props, index) => (
          // Note that it's fine to use index as key here, since the
          // items are static and won't change.
          <ActionItem key={index} {...props} />
        ))}

        {isAirdropEligible && (
          <ActionItem
            hasNotificationDot
            label="Claim Airdrop"
            icon={<GiftLineIcon size="lg" />}
            internalHref={PagePath.ClaimAirdrop}
            tooltip={
              <>
                Congratulations, you are eligible for Airdrop! Click here to
                visit the <strong>Claim Airdrop</strong> page.
              </>
            }
          />
        )}

        {/* This is a special case, so hide it for most users if they're not vesting */}
        {isVesting && (
          <ActionItem
            icon={<ShieldKeyholeLineIcon size="lg" />}
            label="Vest"
            onClick={executeVestTx !== null ? executeVestTx : undefined}
            hasNotificationDot={hasClaimableVestingTokens}
            isDisabled={
              vestTxStatus === TxStatus.Processing ||
              !hasClaimableVestingTokens ||
              executeVestTx === null
            }
            tooltip={
              hasClaimableVestingTokens ? (
                <>
                  You have <strong>{formattedClaimableTokenAmount}</strong>{' '}
                  vested tokens that are ready to be claimed. Use this action to
                  release them.
                </>
              ) : (
                <>
                  You have vesting schedules in your account, but there are no
                  tokens available to claim yet.
                </>
              )
            }
          />
        )}
      </div>

      {/* TODO: Might be better to use a hook instead of doing it this way. */}
      <div className="fixed">
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
  icon: ReactElement<IconBase>;
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
  hasNotificationDot?: boolean;
  internalHref?: InternalPath;
  tooltip?: ReactElement | string;
}) => {
  const {
    icon,
    label,
    onClick,
    internalHref,
    tooltip,
    isDisabled = false,
    hasNotificationDot = false,
  } = props;

  const cursorClass = isDisabled ? '!cursor-not-allowed' : 'cursor-pointer';
  const isDisabledClass = isDisabled ? 'opacity-50' : '';

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
        isDisabledClass,
        cursorClass
      )}
    >
      <div
        onClick={handleClick}
        className={twMerge(
          'inline-flex mx-auto items-center justify-center relative p-2 rounded-lg hover:bg-mono-20 dark:hover:bg-mono-160 text-mono-200 dark:text-mono-0',
          cursorClass
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

        {icon}
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
