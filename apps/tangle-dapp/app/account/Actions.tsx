'use client';

import { ArrowRightUp, QRScanLineIcon } from '@webb-tools/icons';
import ArrowLeftRightLineIcon from '@webb-tools/icons/ArrowLeftRightLineIcon';
import { IconBase } from '@webb-tools/icons/types';
import { Card, IconButton, Typography } from '@webb-tools/webb-ui-components';
import { capitalize } from 'lodash';
import { useRouter } from 'next/navigation';
import { ComponentProps, FC, ReactElement } from 'react';

import useReceiveModal from '../../hooks/useReceiveModal';

const BRIDGE_PATH = 'TEMP_BRIDGE';
const DEPOSIT_PATH = 'DEPOSIT';
const TRANSFER_PATH = 'TRANSFER';
const WITHDRAW_PATH = 'WITHDRAW';

/** @internal */
const paths = [DEPOSIT_PATH, TRANSFER_PATH, WITHDRAW_PATH] as const;

/** @internal */
const icons = [
  <ArrowRightUp key={0} size="lg" />,
  <ArrowLeftRightLineIcon key={1} size="lg" />,
  <ArrowRightUp key={2} size="lg" className="rotate-90" />,
] as const;

/** @internal */
const actionItems = paths.map((path, idx) => ({
  label: capitalize(path),
  path: `/${BRIDGE_PATH}/${path}`,
  icon: icons[idx],
}));

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

      <Typography component="span" variant="body1" className="block">
        {label}
      </Typography>
    </p>
  );
};

/** @internal */
const Actions: FC = () => {
  const navigate = useRouter();
  const { toggleModal } = useReceiveModal();

  return (
    <Card className="flex items-center justify-center space-y-0">
      <div className="flex items-center gap-6">
        <ActionItem
          icon={<QRScanLineIcon size="lg" />}
          label="Receive"
          onClick={() => toggleModal()}
        />

        {actionItems.map(({ path, ...restItem }) => (
          <ActionItem
            key={path}
            {...restItem}
            onClick={() => navigate.push(path)}
          />
        ))}
      </div>
    </Card>
  );
};

export default Actions;
