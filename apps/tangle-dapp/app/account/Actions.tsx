'use client';

import {
  ArrowLeftRightLineIcon,
  CoinIcon,
  CoinsLineIcon,
  GiftLineIcon,
  ShieldKeyholeLineIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/navigation';
import { FC, ReactElement, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useFormattedBalance from '../../hooks/useFormattedBalance';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useVesting from '../../hooks/useVesting';
import { AnchorLinkId, InternalPath, InternalPathString } from '../../types';

type ActionItemDef = {
  label: string;
  path: InternalPathString;
  icon: ReactElement<IconBase>;
};

/** @internal */
const staticActionItems: ActionItemDef[] = [
  {
    label: 'Nominate',
    path: `${InternalPath.EvmStaking}/#${AnchorLinkId.NominationAndPayouts}`,
    icon: <CoinIcon size="lg" />,
  },
  {
    label: 'Payouts',
    path: `${InternalPath.EvmStaking}/#${AnchorLinkId.NominationAndPayouts}`,
    icon: <CoinsLineIcon size="lg" />,
  },
  {
    label: 'Claim Airdrop',
    path: InternalPath.ClaimAirdrop,
    icon: <GiftLineIcon size="lg" />,
  },
] as const;

const Actions: FC = () => {
  const router = useRouter();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const {
    isVesting,
    performVestTx,
    vestTxStatus,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableTokenAmount,
  } = useVesting(true);

  const formattedClaimableTokenAmount =
    useFormattedBalance(claimableTokenAmount);

  // Prefetch static actions that take the user
  // to another internal page. Only do so on the
  // first render, or when the router changes.
  useEffect(() => {
    for (const staticActionItem of staticActionItems) {
      router.prefetch(staticActionItem.path);
    }
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-start gap-6 overflow-x-auto">
        <ActionItem
          icon={<ArrowLeftRightLineIcon size="lg" />}
          label="Transfer"
          onClick={() => setIsTransferModalOpen(true)}
        />

        {staticActionItems.map(({ path, ...restItem }, index) => (
          <ActionItem
            key={index}
            {...restItem}
            onClick={() => router.push(path)}
          />
        ))}

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
                onClick={performVestTx}
                isImportant={hasClaimableVestingTokens}
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
  isImportant?: boolean;
}) => {
  const {
    icon,
    label,
    onClick,
    isDisabled = false,
    isImportant = false,
  } = props;

  const cursorClass = isDisabled ? '!cursor-not-allowed' : '';
  const isDisabledClass = isDisabled ? 'opacity-50' : '';

  const handleClick = () => {
    if (isDisabled || onClick === undefined) {
      return;
    }

    onClick();
  };

  return (
    <p className={twMerge('space-y-2', isDisabledClass, cursorClass)}>
      <IconButton
        className={twMerge('block mx-auto relative', cursorClass)}
        onClick={handleClick}
      >
        {/* Notification dot */}
        {isImportant && (
          <div className="absolute right-1 top-1 rounded-full w-3 h-3 bg-red-40"></div>
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
};

export default Actions;
