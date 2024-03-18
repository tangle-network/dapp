'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import {
  IndependentRoleDistributionChart,
  SharedRoleDistributionChart,
} from '../../../components/charts';
import getRoleDistributionChartDataByAcc, {
  RoleDistributionChartDataType,
} from '../../../data/roleDistributionChart/getRoleDistributionChartDataByAcc';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { RestakingProfileType } from '../../../types';

const IndependentChart = () => {
  const accAddress = useActiveAccountAddress();
  const [data, setData] = useState<RoleDistributionChartDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = accAddress
          ? await getRoleDistributionChartDataByAcc(accAddress)
          : null;
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

  if (error || !data) return <div>Error fetching data</div>;

  return (
    <div className="flex items-center justify-center">
      {data.profileType === RestakingProfileType.SHARED ? (
        <SharedRoleDistributionChart data={data.distribution} />
      ) : (
        <IndependentRoleDistributionChart data={data.distribution} />
      )}
    </div>
  );
};

export default IndependentChart;
