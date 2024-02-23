'use client';
import { useEffect, useState } from 'react';

import { ProportionPieChart } from '../../../components/charts';
import type { ProportionPieChartItem } from '../../../components/charts/types';
import { getRoleDistributionChartDataByAcc } from '../../../data/roleDistributionChart';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';

const IndependentChart = () => {
  const [data, setData] = useState<ProportionPieChartItem[]>([]);
  const accAddress = useActiveAccountAddress();

  useEffect(() => {
    const fetchData = async () => {
      const data = accAddress
        ? await getRoleDistributionChartDataByAcc(accAddress)
        : [];
      setData(data);
    };
    fetchData();
  }, [accAddress]);

  return (
    <div className="flex items-center justify-center">
      <ProportionPieChart data={data} />
    </div>
  );
};

export default IndependentChart;
