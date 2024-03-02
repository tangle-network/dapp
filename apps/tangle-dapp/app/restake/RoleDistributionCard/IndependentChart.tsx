'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import { ProportionPieChart } from '../../../components/charts';
import type { ProportionPieChartItem } from '../../../components/charts/types';
import { TANGLE_TOKEN_UNIT } from '../../../constants';
import { getRoleDistributionChartDataByAcc } from '../../../data/roleDistributionChart';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';

const IndependentChart = () => {
  const accAddress = useActiveAccountAddress();
  const [data, setData] = useState<ProportionPieChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = accAddress
          ? await getRoleDistributionChartDataByAcc(accAddress)
          : [];
        setData(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : WebbError.from(WebbErrorCodes.UnknownError)
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [accAddress]);

  if (isLoading) return null;

  if (error) return <div>Error fetching data</div>;

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
