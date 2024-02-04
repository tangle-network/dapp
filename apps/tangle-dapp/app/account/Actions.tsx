'use client';

import {
  ArrowLeftRightLineIcon,
  CoinIcon,
  CoinsLineIcon,
  GiftLineIcon,
  ShieldKeyholeLineIcon,
  StatusIndicator,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC, ReactElement, useCallback, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useClaims from '../../hooks/useClaims';
import useFormattedBalance from '../../hooks/useFormattedBalance';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useVesting from '../../hooks/useVesting';
import { AnchorLinkId, InternalPath, InternalPathString } from '../../types';

type ActionItemDef = {
  label: string;
  internalHref: InternalPathString;
  icon: ReactElement<IconBase>;
};

/** @internal */
const staticActionItems: ActionItemDef[] = [
  {
    label: 'Nominate',
    internalHref: `${InternalPath.EvmStaking}/#${AnchorLinkId.NominationAndPayouts}`,
    icon: <CoinIcon size="lg" />,
  },
  {
    label: 'Payouts',
    internalHref: `${InternalPath.EvmStaking}/#${AnchorLinkId.NominationAndPayouts}`,
    icon: <CoinsLineIcon size="lg" />,
  },
] as const;

const Actions: FC = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const {
    isVesting,
    executeVestTx,
    vestTxStatus,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableTokenAmount,
  } = useVesting(true);

  const formattedClaimableTokenAmount =
    useFormattedBalance(claimableTokenAmount);

  const { isAirdropEligible } = useClaims();

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
          <Tooltip>
            <TooltipBody className="break-normal max-w-[250px] text-center">
              Congratulations, you are eligible for Airdrop! Click here to visit
              the Airdrop claim page.
            </TooltipBody>

            <TooltipTrigger>
              <ActionItem
                hasNotificationDot
                label="Claim Airdrop"
                icon={<GiftLineIcon size="lg" />}
                internalHref={InternalPath.ClaimAirdrop}
              />
            </TooltipTrigger>
          </Tooltip>
        )}

        {/* This is a special case, so hide it for most users if they're not vesting */}
        {isVesting && (
          <Tooltip>
            <TooltipBody className="break-normal max-w-[250px] text-center">
              {hasClaimableVestingTokens ? (
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
              )}
            </TooltipBody>

            <TooltipTrigger>
              <ActionItem
                icon={<ShieldKeyholeLineIcon size="lg" />}
                label="Vest"
                isDisabled={
                  vestTxStatus === TxStatus.Processing ||
                  !hasClaimableVestingTokens
                }
                onClick={executeVestTx}
                hasNotificationDot={hasClaimableVestingTokens}
              />
            </TooltipTrigger>
          </Tooltip>
        )}
      </div>

      {/* TODO: Might be better to use a hook instead of doing it this way. */}
      <div className="absolute">
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
  internalHref?: InternalPathString;
}) => {
  const {
    icon,
    label,
    onClick,
    internalHref,
    isDisabled = false,
    hasNotificationDot = false,
  } = props;

  const cursorClass = isDisabled ? '!cursor-not-allowed' : '';
  const isDisabledClass = isDisabled ? 'opacity-50' : '';

  const handleClick = useCallback(() => {
    if (isDisabled || onClick === undefined) {
      return;
    }

    onClick();
  }, [isDisabled, onClick]);

  const content = (
    <p className={twMerge('space-y-2', isDisabledClass, cursorClass)}>
      <IconButton
        className={twMerge('block mx-auto relative', cursorClass)}
        onClick={handleClick}
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
      </IconButton>

      <Typography
        component="span"
        variant="body1"
        className="block text-center dark:text-mono-0"
      >
        {label}
      </Typography>
    </p>
  );

  return internalHref !== undefined ? (
    <Link href={internalHref}>{content}</Link>
  ) : (
    content
  );
};

export default Actions;
