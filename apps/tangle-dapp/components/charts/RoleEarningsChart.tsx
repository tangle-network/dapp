'use client';

import { getRoundedAmountString } from '@webb-tools/webb-ui-components';
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

import { ServiceType } from '../../types';
import getChartAreaColorByServiceType from '../../utils/getChartAreaColorByServiceType';
import ChartTooltip from './ChartTooltip';
import type { RoleEarningsChartProps } from './types';

const SERVICES = Object.values(ServiceType);

const RoleEarningsChart: FC<RoleEarningsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24 }} maxBarSize={20}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => getRoundedAmountString(value)}
        />
        <Tooltip content={ChartTooltip} />
        {SERVICES.map((service, idx) => (
          <Bar
            key={service}
            dataKey={service}
            stackId="a"
            fill={getChartAreaColorByServiceType(service)}
            // add radius to the last item
            radius={idx === SERVICES.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RoleEarningsChart;
