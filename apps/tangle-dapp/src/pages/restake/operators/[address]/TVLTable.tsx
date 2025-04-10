import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { useRestakeVaults } from '@tangle-network/tangle-shared-ui/data/restake/useRestakeVaults';
import type {
  DelegatorInfo,
  OperatorMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { type FC } from 'react';
import {
  VaultsTable,
  useVaultsTableProps,
} from '../../../../components/tables/Vaults';

type Props = {
  operatorData: OperatorMetadata | undefined;
  delegatorInfo: DelegatorInfo | null;
};

const TVLTable: FC<Props> = ({ operatorData, delegatorInfo }) => {
  const { assets, isLoading } = useRestakeAssets();
  const assetsTvl = useRestakeAssetsTvl();

  const vaults = useRestakeVaults({
    assets,
    delegatorInfo,
    assetsTvl,
    operatorData,
  });

  const tableProps = useVaultsTableProps({
    delegatorDeposits: delegatorInfo?.deposits,
    assets,
    assetsTvl,
  });

  return (
    <VaultsTable
      isLoading={isLoading}
      emptyTableProps={{
        title: 'No TVL data available',
        description:
          'This operator currently has no Total Value Locked (TVL). You can delegate to this operator to contribute to their TVL and see it reflected here.',
      }}
      data={vaults}
      tableProps={tableProps}
    />
  );
};

export default TVLTable;
