'use client';

import { formatBalance } from '@polkadot/util';
import {
  ArrowLeftRightLineIcon,
  CoinIcon,
  GiftLineIcon,
  ShieldKeyholeLineIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { IconButton, Typography } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/navigation';
import { ComponentProps, FC, ReactElement, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useReceiveModal from '../../hooks/useReceiveModal';
import { TxStatus } from '../../hooks/useSubstrateTx';
import useVesting from '../../hooks/useVesting';
import { AnchorLinkId, InternalPath, InternalPathString } from '../../types';
import { CoinsLineIcon } from '../../../../libs/icons/src/CoinsLineIcon';

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

/** @internal */
const ActionItem = (props: {
  icon: ReactElement<IconBase>;
  label: string;
  onClick?: ComponentProps<'button'>['onClick'];
  isDisabled?: boolean;
}) => {
  const { icon, label, onClick, isDisabled = false } = props;
  const cursorClass = isDisabled ? '!cursor-not-allowed' : '';
  const isDisabledClass = isDisabled ? 'opacity-50' : '';

  return (
    <p className={twMerge('space-y-2', isDisabledClass, cursorClass)}>
      <IconButton
        className={twMerge('block mx-auto', cursorClass)}
        onClick={onClick}
      >
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

const Actions: FC = () => {
  const router = useRouter();
  const { toggleModal: toggleReceiveModal } = useReceiveModal();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const {
    isVesting,
    performVestTx,
    vestTxStatus,
    hasClaimableTokens: hasClaimableVestingTokens,
    claimableTokenAmount,
  } = useVesting(true);

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

        {/* This is a special case, so hide it for most users if they're not vesting. */}
        {isVesting && (
          <ActionItem
            icon={<ShieldKeyholeLineIcon size="lg" />}
            label="Vest"
            isDisabled={vestTxStatus === TxStatus.Processing}
            onClick={performVestTx}
          />
        )}
      </div>

      <div>
        Claimable vesting tokens:
        {claimableTokenAmount !== null
          ? formatBalance(claimableTokenAmount, {
              decimals: 18,
              withUnit: 'tTNT',
            })
          : 'WAITING'}
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

export default Actions;
