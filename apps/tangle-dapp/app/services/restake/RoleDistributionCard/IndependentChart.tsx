'use client';

import { Cell, Pie, PieChart, Tooltip } from 'recharts';

import { ServiceType } from '../../../../types';

const data = [
  { name: [ServiceType.ZK_SAAS_GROTH16], value: 400 },
  { name: [ServiceType.ZK_SAAS_MARLIN], value: 300 },
  { name: [ServiceType.TX_RELAY], value: 300 },
  { name: [ServiceType.DKG_TSS_CGGMP], value: 200 },
];

const COLORS = ['#85DC8E', '#B8D6FF', '#E7E2FF', '#FFEAA6'];

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
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="px-4 py-2 bg-mono-0 rounded-lg dark:bg-mono-180 text-mono-120 dark:text-mono-80">
                  {payload[0].name}: {payload[0].value}
                </div>
              );
            }

            return null;
          }}
        />
      </PieChart>
    </div>
  );
};

export default IndependentChart;
