import { Updater } from '@tanstack/react-table';
import { WebbComponentBase } from '../../types';
import { PaginationItemsOptions } from '../../utils';

type PickedKeys = 'boundaryCount' | 'siblingCount';

/**
 * The `Pagination` props
 */
export interface PaginationProps extends WebbComponentBase, Pick<PaginationItemsOptions, PickedKeys> {
  /**
   * The number of items per page
   */
  itemsPerPage?: number;
  /**
   * The number of total items
   */
  totalItems?: number;
  /**
   * The current page
   */
  page?: number;
  /**
   * The number of total pages
   */
  totalPages?: number;
  /**
   * Whether can go to the previous page
   */
  canPreviousPage?: boolean;
  /**
   * Callback to go to the previous page
   */
  previousPage?: () => void;
  /**
   * Whether can go to the next page
   */
  canNextPage?: boolean;
  /**
   * Callback to go to the next page
   */
  nextPage?: () => void;
  /**
   * Update current page to page index
   */
  setPageIndex?: (updater: Updater<number>) => void;
}
