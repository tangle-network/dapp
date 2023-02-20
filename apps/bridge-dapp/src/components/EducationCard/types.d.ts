import { PropsOf } from '@webb-tools/webb-ui-components/types';

export interface EducationCardProps extends PropsOf<'div'> {
  currentTab: 'Deposit' | 'Withdraw' | 'Transfer';
}
