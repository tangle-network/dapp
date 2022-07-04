import { ProposalStatus } from '@webb-dapp/page-governance/src/types';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Chip, ChipProps } from '@webb-dapp/ui-components/Chip';
import React, { useMemo } from 'react';

export interface ChipStatusProps {
  status: ProposalStatus;
}

export const ChipStatus: React.FC<ChipStatusProps> = ({ status }) => {
  const pallet = useColorPallet();

  const commonProps: Partial<ChipProps> = useMemo(
    () => ({
      style: {
        textTransform: 'uppercase',
        borderRadius: '4px',
        fontWeight: '700',
        fontSize: '12px',
        color: pallet.primaryText,
      },
      variant: status === 'active' ? 'outlined' : undefined,
      size: 'small',
    }),
    [status, pallet]
  );

  switch (status) {
    case 'active': {
      return <Chip color='default' label='active' {...commonProps} />;
    }

    case 'executed': {
      return <Chip color='success' label='executed' {...commonProps} />;
    }

    case 'defeated': {
      return <Chip color='warning' label='defeated' {...commonProps} />;
    }

    default: {
      return <Chip color='error' label='undefined' {...commonProps} />;
    }
  }
};
