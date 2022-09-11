import { RowData, useReactTable } from '@tanstack/react-table';
import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { AuthoritiesType } from '../KeyStatusCard/types';
import { PaginationProps } from '../Pagination/types';

/**
 * The `Table` props
 */
export interface TableProps<T extends RowData> extends WebbComponentBase {
  /**
   * The table object, the return result of `useReactTable` hook
   */
  tableProps: ReturnType<typeof useReactTable<T>>;
  /**
   * Whether the table has pagination. If `true`, the `paginationProps` must be provided
   */
  isPaginated?: boolean;
  /**
   * The pagination props for `Pagination` component to display
   */
  paginationProps?: PaginationProps;
  /**
   * If `true`, the table footer will be displayed
   */
  isDisplayFooter?: boolean;
}

/**
 * The `THeader` props
 */
export interface THeaderProps extends PropsOf<'th'>, WebbComponentBase {}

/**
 * The `TData` props
 */
export interface TDataProps extends PropsOf<'td'>, WebbComponentBase {}
