import type { Row, RowData, useReactTable } from '@tanstack/react-table';
import type {
  IWebbComponentBase,
  PropsOf,
  WebbComponentBase,
} from '../../types';

/**
 * The `Table` props
 */
export interface TableProps<T extends RowData, E extends HTMLElement>
  extends WebbComponentBase {
  /**
   * The table object, the return result of `useReactTable` hook
   */
  tableProps: ReturnType<typeof useReactTable<T>>;

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

  /**
   * The optional class name for overriding style table component
   */
  tableClassName?: string;

  /**
   * The optional class name for overriding style of the div that wraps the table
   */
  tableWrapperClassName?: string;

  /**
   * The optional class name for overriding style THeader component
   */
  thClassName?: string;

  /**
   * The optional class name for overriding style tbody component
   */
  tbodyClassName?: string;

  /**
   * The optional class name for overriding style table row component
   */
  trClassName?: string;

  /**
   * The optional class name for overriding style TData component
   */
  tdClassName?: string;

  /**
   * The optional class name for overriding style Pagination component
   */
  paginationClassName?: string;

  /**
   * The table title to display in the pagination
   */
  title?: string;

  /**
   * Handle when the row is clicked
   */
  onRowClick?: (row: Row<T>) => void;

  /**
   * The optional ref to forward to the table component
   */
  ref?: React.Ref<E>;

  isDisabledRowHoverStyle?: boolean;
}

/**
 * The `THeader` props
 */
export interface THeaderProps extends PropsOf<'th'>, IWebbComponentBase {}

/**
 * The `TData` props
 */
export interface TDataProps extends PropsOf<'td'>, IWebbComponentBase {
  isDisabledHoverStyle?: boolean;
}
