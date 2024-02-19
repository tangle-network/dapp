'use client';

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

import ChartTooltip from '../../../../components/ChartTooltip';
import { ServiceType } from '../../../../types';

const data = [
  {
    month: 'Jan',
    [ServiceType.ZK_SAAS_GROTH16]: 4000,
    [ServiceType.TX_RELAY]: 2400,
    [ServiceType.DKG_TSS_CGGMP]: 2400,
  },
  {
    month: 'Feb',
    [ServiceType.ZK_SAAS_GROTH16]: 3000,
    [ServiceType.TX_RELAY]: 1398,
    [ServiceType.DKG_TSS_CGGMP]: 2210,
  },
  {
    month: 'Mar',
    [ServiceType.ZK_SAAS_GROTH16]: 2000,
    [ServiceType.TX_RELAY]: 9800,
    [ServiceType.DKG_TSS_CGGMP]: 2290,
  },
  {
    month: 'Apr',
    [ServiceType.ZK_SAAS_GROTH16]: 2780,
    [ServiceType.TX_RELAY]: 3908,
    [ServiceType.DKG_TSS_CGGMP]: 2000,
  },
  {
    month: 'May',
    [ServiceType.ZK_SAAS_GROTH16]: 1890,
    [ServiceType.TX_RELAY]: 4800,
    [ServiceType.DKG_TSS_CGGMP]: 2181,
  },
  {
    month: 'Jun',
    [ServiceType.ZK_SAAS_GROTH16]: 2390,
    [ServiceType.TX_RELAY]: 3800,
    [ServiceType.DKG_TSS_CGGMP]: 2500,
  },
  {
    month: 'Jul',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
  {
    month: 'Aug',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
  {
    month: 'Sep',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
  {
    month: 'Oct',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
  {
    month: 'Nov',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
  {
    month: 'Dec',
    [ServiceType.ZK_SAAS_GROTH16]: 3490,
    [ServiceType.TX_RELAY]: 4300,
    [ServiceType.DKG_TSS_CGGMP]: 2100,
  },
];

const EarningsChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 24 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" />
        <YAxis axisLine={false} />
        <Tooltip content={ChartTooltip} />
        <Legend />
        <Bar dataKey={ServiceType.DKG_TSS_CGGMP} stackId="a" fill="#85DC8E" />
        <Bar dataKey={ServiceType.ZK_SAAS_GROTH16} stackId="a" fill="#B8D6FF" />
        <Bar dataKey={ServiceType.TX_RELAY} stackId="a" fill="#E7E2FF" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsChart;
