import { ColumnDef, SortingState } from '@tanstack/react-table';

export interface VaultsTableProps<TVault, TAsset> {
  vaultsData: TVault[];
  vaultsColumns: ColumnDef<TVault, any>[];
  assetsColumns: ColumnDef<TAsset, any>[];
  title: string;
  initialSorting?: SortingState;
  isPaginated?: boolean;
}

export interface AssetsTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  isShown: boolean;
}
