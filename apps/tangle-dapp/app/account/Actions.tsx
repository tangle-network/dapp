'use client';

import { BN } from '@polkadot/util';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import {
  ArrowLeftRightLineIcon,
  ArrowRightUp,
  GiftLineIcon,
  QRScanLineIcon,
  ShieldKeyholeLineIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { IconButton, Typography } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/navigation';
import { ComponentProps, FC, ReactElement, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useStakingRewards from '../../data/StakingStats/useStakingRewards';
import useReceiveModal from '../../hooks/useReceiveModal';
import useTx from '../../hooks/useTx';
import { AnchorLinkId, InternalPath } from '../../types';

type ActionItemDef = {
  label: string;
  path: string;
  icon: ReactElement<IconBase>;
};

/** @internal */
const staticActionItems: ActionItemDef[] = [
  {
    label: 'Vest',
    path: InternalPath.Claim,
    icon: <ShieldKeyholeLineIcon size="lg" />,
  },
  {
    label: 'Nominate',
    path: `${InternalPath.EvmStaking}/#${AnchorLinkId.NominationAndPayouts}`,
    icon: <ArrowRightUp size="lg" className="rotate-90" />,
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
        className="block text-center"
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
  const { value: rewards } = useStakingRewards();
  const activeAccount = useActiveAccount();

  const { perform: performClaimRewardsTx } = useTx(async (api) => {
    if (
      rewards === null ||
      activeAccount[0] === null ||
      activeAccount[0].address === null
    ) {
      return null;
    }

    const activeAccountAddress = activeAccount[0].address;
    const ledgerOpt = await api.query.staking.ledger(activeAccountAddress);

    if (ledgerOpt.isNone) {
      return null;
    }

    const ledger = ledgerOpt.unwrap();

    const startEra = ledger.claimedRewards[ledger.claimedRewards.length - 1]
      .add(new BN(1))
      .toNumber();

    const currentEraOpt = await api.query.staking.currentEra();

    if (currentEraOpt.isNone) {
      return null;
    }

    const endEra = currentEraOpt.unwrap().toNumber();

    return api.tx.staking.claimRewards({});
  });

  // Prefetch static actions that take the user
  // to another internal page. Only do so on the
  // first render, or when the router changes.
  useEffect(() => {
    for (const staticActionItem of staticActionItems) {
      router.prefetch(staticActionItem.path);
    }
  }, [router]);

  const hasUnclaimedRewards =
    rewards !== null && rewards.pendingRewards.gt(new BN(0));

  const claimStakingRewards = () => {
    // Sanity check. Claim button should be disabled
    // if there are no rewards to claim, but just in case.
    if (!hasUnclaimedRewards) {
      return;
    }

    performClaimRewardsTx();
  };

  return (
    <>
      <GlassCard className="flex justify-center align-center">
        <div className="flex items-center justify-center gap-6 overflow-x-auto">
          <ActionItem
            icon={<QRScanLineIcon size="lg" />}
            label="Receive"
            onClick={() => toggleReceiveModal()}
          />

          <ActionItem
            icon={<ArrowLeftRightLineIcon size="lg" />}
            label="Transfer"
            onClick={() => setIsTransferModalOpen(true)}
          />

          <ActionItem
            icon={<GiftLineIcon size="lg" />}
            label="Claim Rewards"
            isDisabled={!hasUnclaimedRewards}
            onClick={claimStakingRewards}
          />

          {staticActionItems.map(({ path, ...restItem }, index) => (
            <ActionItem
              key={index}
              {...restItem}
              onClick={() => router.push(path)}
            />
          ))}
        </div>
      </GlassCard>

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
