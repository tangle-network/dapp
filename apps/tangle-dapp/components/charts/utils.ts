import { PieChartItem } from './types';

export function formatDataForPieCharts(data: PieChartItem[]) {
  return data.map((item) => ({
    ...item,
    value: item.value.toString(),
  }));
}
