'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import { RoleEarningsChart } from '../../../components/charts';
import type { RoleEarningsChartItem } from '../../../components/charts/types';
import { getRoleEarningsChartDataByAcc } from '../../../data/roleEarningsChart';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';

const EarningsChart = () => {
  const accAddress = useActiveAccountAddress();
  const [data, setData] = useState<RoleEarningsChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = accAddress
          ? await getRoleEarningsChartDataByAcc(accAddress)
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

  return <RoleEarningsChart data={data} />;
};

export default EarningsChart;
