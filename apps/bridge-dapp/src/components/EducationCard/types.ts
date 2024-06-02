import { PropsOf } from '@webb-tools/webb-ui-components/types';

export interface EducationCardProps extends PropsOf<'div'> {
  /**
   * The current active tab
   */
  currentTab: 'Deposit' | 'Withdraw' | 'Transfer';

  /**
   * If `true`, the education card will be closed by default
   */
  defaultOpen?: boolean;
}
