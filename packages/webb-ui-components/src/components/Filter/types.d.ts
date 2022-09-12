import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface FilterProps extends WebbComponentBase, PropsOf<'div'> {
  /**
   * The search text
   */
  searchText?: string;
  /**
   * Callback to control the search text
   */
  onSearchChange?: (nextValue: string | number) => void;
}
