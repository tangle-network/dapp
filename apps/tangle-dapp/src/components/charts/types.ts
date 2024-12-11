import { BN } from '@polkadot/util';

export type PieChartItem = {
  name: string;
  value: BN;
  color: string;
};

export interface PieChartProps {
  data: PieChartItem[];
  title?: string;
}

export type RoleEarningsChartItem = {
  era: number;
  // TODO: might need to change from number to BN here
  reward: number;
};

export interface RoleEarningsChartProps {
  data: RoleEarningsChartItem[];
}
