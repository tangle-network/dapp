import type { PropsOf } from '@webb-tools/webb-ui-components';

export type TabsContainerProps = PropsOf<'div'> & {
  tabs: string[];
  activeTab?: string;
};
