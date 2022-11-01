import { RowData, useReactTable } from '@tanstack/react-table';
import { PropsOf, WebbComponentBase, IWebbComponentBase } from '../../types';

/**
 * The `Table` props
 */
export interface TableProps<T extends RowData> extends WebbComponentBase {
  /**
   * The table object, the return result of `useReactTable` hook
   */
  tableProps: ReturnType<typeof useReactTable>;
  /**
   * Whether the table has pagination. If `true`, the `paginationProps` must be provided
   */
  isPaginated?: boolean;
  /**
   * If `true`, the table footer will be displayed
   */
  isDisplayFooter?: boolean;
  /**
   * The total number of records in the table.
   * This usually will be the number return from backend
   * @default 0
   */
  totalRecords?: number;
}

/**
 * The `THeader` props
 */
export interface THeaderProps extends PropsOf<'th'>, IWebbComponentBase {}

/**
 * The `TData` props
 */
export interface TDataProps extends PropsOf<'td'>, IWebbComponentBase {}
