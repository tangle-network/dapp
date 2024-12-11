import { PieChartItem } from './types';

export function formatDataForPieCharts(data: PieChartItem[]) {
  return data.map((item) => ({
    ...item,
    // Recharts only receive number as value type
    // this might be a problem with BN that are out of range of JS
    value: +item.value.toString(),
  }));
}
