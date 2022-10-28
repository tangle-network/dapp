import { PropsOf, IWebbComponentBase } from '../../types';

export interface FilterProps extends IWebbComponentBase, PropsOf<'div'> {
  /**
   * The search text
   */
  searchText?: string;
  /**
   * Callback to control the search text
   */
  onSearchChange?: (nextValue: string | number) => void;
  /**
   * Clear all filters function
   */
  clearAllFilters?: () => void;

  /**
   * Search field place holder*/
   searchPlaceholder?: string;
}
