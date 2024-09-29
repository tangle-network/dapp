'use client';

import { FC } from 'react';

import VaultAssetsTableUI from '../../../components/tables/VaultAssets';
import useVaultAssets from './useVaultAssets';

interface VaultAssetsTableProps {
  LSTTokenIcon: string;
  isShown: boolean;
}

const VaultAssetsTable: FC<VaultAssetsTableProps> = ({
  LSTTokenIcon,
  isShown,
}) => {
  const data = useVaultAssets(LSTTokenIcon);

  return <VaultAssetsTableUI isShown={isShown} data={data} />;
};

export default VaultAssetsTable;
