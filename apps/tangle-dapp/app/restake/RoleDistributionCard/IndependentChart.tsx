'use client';

import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import ChartTooltip from '../../../components/ChartTooltip';
import { ServiceType } from '../../../types';

const data = [
  { name: [ServiceType.ZK_SAAS_GROTH16], value: 400 },
  { name: [ServiceType.ZK_SAAS_MARLIN], value: 300 },
  { name: [ServiceType.TX_RELAY], value: 300 },
  { name: [ServiceType.DKG_TSS_CGGMP], value: 200 },
];

export const INDEPENDENT_CHART_COLORS = [
  '#85DC8E',
  '#B8D6FF',
  '#E7E2FF',
  '#FFEAA6',
];

const IndependentChart = () => {
  return (
    <div className="flex items-center justify-center">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                INDEPENDENT_CHART_COLORS[
                  index % INDEPENDENT_CHART_COLORS.length
                ]
              }
            />
          ))}
        </Pie>

        <Tooltip content={ChartTooltip} />
      </PieChart>
    </div>
  );
};

export default IndependentChart;
