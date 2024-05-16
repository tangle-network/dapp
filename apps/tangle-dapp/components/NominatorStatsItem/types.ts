import React from 'react';

export interface NominatorStatsItemProps {
  title: string;
  tooltip?: string | React.ReactNode;
  className?: string;
  children: React.ReactNode | null;
  isError: boolean;
}
