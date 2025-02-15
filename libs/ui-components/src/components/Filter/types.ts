import { PropsOf, IComponentBase } from '../../types';

export interface FilterProps extends IComponentBase, PropsOf<'div'> {
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
