import type {
  DelegatorInfo,
  OperatorMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { type FC } from 'react';
import VaultsTable from '../../../../components/tables/Vaults';
import useVaultTableData from '../../../../hooks/useVaultTableData';

type Props = {
  operatorData: OperatorMetadata | undefined;
  delegatorInfo: DelegatorInfo | null;
};

const TVLTable: FC<Props> = ({ operatorData, delegatorInfo }) => {
  const { vaults, tableProps } = useVaultTableData({
    operatorData,
    delegatorInfo,
  });

  return (
    <VaultsTable
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
