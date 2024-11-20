'use client';

import { useMemo } from 'react';
import { UseFormWatch } from 'react-hook-form';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeRewardConfig from '../../../data/restake/useRestakeRewardConfig';
import { DepositFormFields } from '../../../types/restake';
import pluralize from '../../../utils/pluralize';

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

    if (asset === undefined || asset.vaultId === null) {
      return null;
    }

    return rewardConfig.configs[asset.vaultId]?.apy ?? null;
  }, [assetId, assetMap, rewardConfig.configs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="APY"
        value={apy !== null ? `${apy}%` : EMPTY_VALUE_PLACEHOLDER}
      />

      <DetailItem
        title="Withdraw Period"
        value={
          bondDuration !== null
            ? `${bondDuration} ${pluralize('session', bondDuration !== 1)}`
            : EMPTY_VALUE_PLACEHOLDER
        }
        tooltip="The duration for which the deposited asset is locked."
      />
    </DetailsContainer>
  );
}
