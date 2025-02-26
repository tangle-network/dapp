import { StatsItem } from '@tangle-network/ui-components';
import type { FC, ReactNode } from 'react';

export type NominatorStatsItemProps = {
  title: string;
  tooltip?: string | ReactNode;
  className?: string;
  children: ReactNode | null;
  isError: boolean;
};

export const NominatorStatsItem: FC<NominatorStatsItemProps> = (props) => {
  return <StatsItem {...props} />;
};
