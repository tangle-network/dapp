'use client';

import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import { useMemo } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeRewardConfig from '../../../data/restake/useRestakeRewardConfig';
import { DepositFormFields } from '../../../types/restake';

type Props = {
  watch: UseFormWatch<DepositFormFields>;
};

export default function TxDetails({ watch }: Props) {
  const assetId = watch('depositAssetId');

  const { assetMap } = useRestakeContext();
  const { bondDuration } = useRestakeConsts();

  const { rewardConfig } = useRestakeRewardConfig();

  const apy = useMemo(() => {
    if (assetId === null) {
      return null;
    }

    const asset = assetMap[assetId];
    if (asset === undefined || asset.poolId === null) {
      return null;
    }

    return rewardConfig.configs[asset.poolId]?.apy ?? null;
  }, [assetId, assetMap, rewardConfig.configs]);

  return (
    <FeeDetails
      isDisabledBgColor
      disabled
      isDefaultOpen
      items={[
        {
          name: 'APY',
          info: 'Restaking Rewards',
          value: apy !== null ? `${apy}%` : apy,
        },
        {
          name: 'Withdraw Period',
          info: 'The duration for which the deposited asset is locked.',
          value:
            bondDuration !== null ? `${bondDuration} rounds` : bondDuration,
        },
      ]}
    />
  );
}
