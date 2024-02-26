'use client';

import { useEffect, useState } from 'react';

import { ProportionPieChart } from '../../../components/charts';
import type { ProportionPieChartItem } from '../../../components/charts/types';
import { TANGLE_TOKEN_UNIT } from '../../../constants';
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
      <ProportionPieChart
        data={data}
        title="Restaked"
        showTotal
        unit={TANGLE_TOKEN_UNIT}
      />
    </div>
  );
};

export default IndependentChart;
