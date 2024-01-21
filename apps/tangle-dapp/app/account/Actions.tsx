'use client';

import {
  ArrowRightUp,
  GiftLineIcon,
  QRScanLineIcon,
  ShieldKeyholeLineIcon,
} from '@webb-tools/icons';
import ArrowLeftRightLineIcon from '@webb-tools/icons/ArrowLeftRightLineIcon';
import { IconBase } from '@webb-tools/icons/types';
import { IconButton, Typography } from '@webb-tools/webb-ui-components';
import { useRouter } from 'next/navigation';
import { ComponentProps, FC, ReactElement } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useReceiveModal from '../../hooks/useReceiveModal';
import { AnchorLinkId, InternalPath } from '../../types';

type ActionItemDef = {
  label: string;
  path: string;
  icon: ReactElement<IconBase>;
};

/** @internal */
const actionItems: ActionItemDef[] = [
  {
    label: 'Transfer',
    path: InternalPath.Claim,
    icon: <ArrowLeftRightLineIcon size="lg" />,
  },
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
  const navigate = useRouter();
  const { toggleModal: toggleReceiveModal } = useReceiveModal();

  return (
    <GlassCard className="flex justify-center align-center">
      <div className="flex items-center justify-center gap-6 overflow-x-auto">
        <ActionItem
          icon={<QRScanLineIcon size="lg" />}
          label="Receive"
          onClick={() => toggleReceiveModal()}
        />

        {actionItems.map(({ path, ...restItem }) => (
          <ActionItem
            key={path}
            {...restItem}
            onClick={() => navigate.push(path)}
          />
        ))}
      </div>
    </GlassCard>
  );
};

export default Actions;
