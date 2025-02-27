import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import type { Table } from '@tangle-network/ui-components/components/Table';
import type { ComponentProps } from 'react';
import type { RestakeVault } from '../../../utils/createVaultMap';

export type Props = {
  data: RestakeVault[] | null;
  isLoading?: boolean;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableProps?: Partial<ComponentProps<typeof Table<RestakeVault>>>;
};
