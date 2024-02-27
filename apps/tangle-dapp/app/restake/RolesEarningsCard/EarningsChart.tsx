'use client';

import { randNumber } from '@ngneat/falso';
import { useNextDarkMode } from '@webb-tools/webb-ui-components/hooks/useDarkMode';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ChartTooltip from '../../../components/charts/ChartTooltip';
import { ServiceType } from '../../../types';

const randNum = () => randNumber({ min: 1000, max: 4000, precision: 100 });

const data = [
  {
    month: 'Jan',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Feb',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Mar',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Apr',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'May',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Jun',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Jul',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Aug',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Sep',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Oct',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Nov',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Dec',
    yaxis: randNum(),
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
];

const EarningsChart = () => {
  const [isDarkMode] = useNextDarkMode();

  const isEmptyData = true;

  return (
    <div className="relative h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24 }} maxBarSize={20}>
          <CartesianGrid
            vertical={false}
            stroke={isDarkMode ? '#3A3E53' : '#D3D8E2'}
          />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
            tickLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
          />
          <YAxis
            dataKey={isEmptyData ? 'yaxis' : undefined}
            axisLine={false}
            tickLine={{ stroke: isDarkMode ? '#3A3E53' : '#D3D8E2' }}
            label={{ fill: 'red' }}
          />
          <Tooltip content={ChartTooltip} />
          <Legend />
          {!isEmptyData && (
            <>
              <Bar
                dataKey={ServiceType.DKG_TSS_CGGMP}
                stackId="a"
                fill="#85DC8E"
              />
              <Bar
                dataKey={ServiceType.ZK_SAAS_GROTH16}
                stackId="a"
                fill="#B8D6FF"
              />
              <Bar
                radius={[4, 4, 0, 0]}
                dataKey={ServiceType.TX_RELAY}
                stackId="a"
                fill="#E7E2FF"
              />
            </>
          )}
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

export default EarningsChart;
