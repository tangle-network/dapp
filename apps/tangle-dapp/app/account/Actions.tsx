'use client';

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
import { ComponentProps, FC, ReactElement, useState } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import TransferTxContainer from '../../containers/TransferTxContainer/TransferTxContainer';
import useReceiveModal from '../../hooks/useReceiveModal';
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
    label: 'Claim Airdrop',
    path: InternalPath.Claim,
    icon: <GiftLineIcon size="lg" />,
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
}) => {
  const { icon, label, onClick } = props;

  return (
    <p className="space-y-2">
      <IconButton className="block mx-auto" onClick={onClick}>
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
