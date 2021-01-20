import React, { FC, useMemo } from 'react';

import { Chart, Interval, Tooltip, Coordinate, Axis, Interaction } from 'bizcharts';
import { Card } from '@webb-dapp/ui-components';
import { useSwapOverview } from '@webb-dapp/react-hooks';
import { getTokenName, getTokenColor, FormatValue } from '@webb-dapp/react-components';

interface ChartData {
  currency: string;
  value: number;
  percent: number;
}

export const SwapPool: FC = () => {
  const overview = useSwapOverview();

  const chartData = useMemo<ChartData[]>(() => {
    if (!overview) return [];

    return overview.details.map((item) => {
      return {
        currency: getTokenName(item.currency),
        percent: item.value.div(overview.total).toNumber() || 0,
        value: item.value.toNumber()
      };
    });
  }, [overview]);

  const cols = useMemo(() => {
    return {
      precent: {
        formatter: (val: number): string => (val * 100).toFixed(2) + '%'
      }
    };
  }, []);

  if (!overview) return null;

  return (
    <Card extra={<FormatValue data={overview.total} />} header='Swap Pool Overview'>
      <Chart animate={false} autoFit data={chartData} height={400} scale={cols}>
        <Coordinate radius={0.75} type='theta' />
        <Tooltip />
        <Axis visible={false} />
        <Interval
          adjust='stack'
          color={['currency', (item: string): string => getTokenColor(item)]}
          label={[
            'count',
            {
              content: (data: any): string => {
                return `${data.currency}: ${(data.percent * 100).toFixed(2)}%, $${data.value}`;
              }
            }
          ]}
          position='percent'
          style={{
            lineWidth: 1,
            stroke: '#fff'
          }}
        />
        <Interaction type='element-single-selected' />
      </Chart>
    </Card>
  );
};
