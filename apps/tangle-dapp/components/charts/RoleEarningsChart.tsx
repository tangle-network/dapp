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

import { ServiceType } from '../../types';
import getChartAreaColorByServiceType from '../../utils/getChartAreaColorByServiceType';
import type { RoleEarningsChartProps } from './types';

const SERVICES = Object.values(ServiceType);

const RoleEarningsChart: FC<RoleEarningsChartProps> = ({ data, unit }) => {
  const [isDarkMode] = useNextDarkMode();

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
            dataKey="month"
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
                    month={payload[0].payload.month}
                    year={payload[0].payload.year}
                    suffix={unit}
                    services={SERVICES.map((service) => ({
                      name: service,
                      value: payload[0].payload[service],
                    }))}
                  />
                );
              }
            }}
          />
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
  month,
  year,
  services,
  suffix,
}: {
  month: string;
  year: number;
  suffix?: string;
  services: {
    name: ServiceType;
    value?: number;
  }[];
}) => {
  return (
    <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-120 dark:text-mono-80">
      <Typography variant="body2" fw="semibold" className="whitespace-nowrap">
        {month} {year}
      </Typography>
      {services
        .filter((service) => service.value)
        .map((service) => (
          <div key={service.name} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: getChartAreaColorByServiceType(service.name),
              }}
            />
            <Typography variant="body2" className="whitespace-nowrap">
              {service.name}: {getRoundedAmountString(service.value)}{' '}
              {suffix ?? ''}
            </Typography>
          </div>
        ))}
    </div>
  );
};
