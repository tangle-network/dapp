'use client';

import { randNumber } from '@ngneat/falso';
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
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Feb',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Mar',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Apr',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'May',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Jun',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Jul',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Aug',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Sep',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Oct',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Nov',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
  {
    month: 'Dec',
    [ServiceType.ZK_SAAS_GROTH16]: randNum(),
    [ServiceType.TX_RELAY]: randNum(),
    [ServiceType.DKG_TSS_CGGMP]: randNum(),
  },
];

const EarningsChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24 }} maxBarSize={20}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" />
        <YAxis axisLine={false} />
        <Tooltip content={ChartTooltip} />
        <Legend />
        <Bar dataKey={ServiceType.DKG_TSS_CGGMP} stackId="a" fill="#85DC8E" />
        <Bar dataKey={ServiceType.ZK_SAAS_GROTH16} stackId="a" fill="#B8D6FF" />
        <Bar
          radius={[4, 4, 0, 0]}
          dataKey={ServiceType.TX_RELAY}
          stackId="a"
          fill="#E7E2FF"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsChart;
