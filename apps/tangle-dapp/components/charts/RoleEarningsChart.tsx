'use client';

import {
  getRoundedAmountString,
  Typography,
  useNextDarkMode,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartColor } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import type { RoleEarningsChartProps } from './types';

const RoleEarningsChart: FC<RoleEarningsChartProps> = ({ data }) => {
  const [isDarkMode] = useNextDarkMode();
  const { nativeTokenSymbol } = useNetworkStore();

  const isEmptyData = data.length === 0;

  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24 }} maxBarSize={20} barGap={0}>
          <CartesianGrid
            vertical={false}
            stroke={isDarkMode ? '#3A3E53' : '#D3D8E2'}
          />
          <XAxis
            dataKey="era"
            tick={{
              fontSize: '12px',
              fill: isDarkMode ? '#C2C8D4' : '#1F1D2B',
              fontWeight: 400,
            }}
            axisLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
            tickLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
          />
          <YAxis
            axisLine={false}
            width={40}
            tickFormatter={(value) => getRoundedAmountString(value)}
            tick={{
              fontSize: '12px',
              fill: isDarkMode ? '#C2C8D4' : '#1F1D2B',
              fontWeight: 400,
            }}
            tickLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <TooltipContent
                    era={payload[0].payload.era}
                    suffix={nativeTokenSymbol}
                    reward={payload[0].payload.reward}
                  />
                );
              }
            }}
          />
          <Bar
            dataKey="reward"
            stackId="a"
            fill={ChartColor.LAVENDER}
            // add radius to the last item
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {isEmptyData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-80"
          >
            No Earnings to Display
          </Typography>
        </div>
      )}
    </div>
  );
};

// TODO: remove this later
// Suppress the warning about missing defaultProps in recharts library
// @link https://github.com/recharts/recharts/issues/3615
// temporary solution: https://github.com/recharts/recharts/issues/3615#issuecomment-1947814453
const error = console.error;
console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

export default RoleEarningsChart;

/** @internal */
const TooltipContent = ({
  era,
  reward,
  suffix,
}: {
  era: number;
  reward: number;
  suffix?: string;
}) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        Era: {era}
      </Typography>
      <div className="flex items-center gap-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: ChartColor.LAVENDER,
          }}
        />
        <Typography variant="body2" className="whitespace-nowrap">
          Reward: {getRoundedAmountString(reward)} {suffix ?? ''}
        </Typography>
      </div>
    </div>
  );
};
