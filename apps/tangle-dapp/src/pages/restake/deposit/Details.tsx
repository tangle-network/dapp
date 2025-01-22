import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import { UseFormWatch } from 'react-hook-form';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeRewardConfig from '../../../data/restake/useRestakeRewardConfig';
import { DepositFormFields } from '../../../types/restake';

type Props = {
  watch: UseFormWatch<DepositFormFields>;
};

const Details: FC<Props> = ({ watch }) => {
  const { assetMetadataMap } = useRestakeContext();
  const { bondDuration } = useRestakeConsts();
  const rewardConfig = useRestakeRewardConfig();

  const assetId = watch('depositAssetId');

  const apy = useMemo(() => {
    if (assetId === null || rewardConfig === null) {
      return null;
    }

    const asset = assetMetadataMap[assetId];

    if (asset === undefined || asset.vaultId === null) {
      return null;
    }

    return rewardConfig.get(asset.vaultId)?.apy ?? null;
  }, [assetId, assetMetadataMap, rewardConfig]);

  return (
    <DetailsContainer>
      <DetailItem
        title="APY"
        value={apy !== null ? `${apy}%` : EMPTY_VALUE_PLACEHOLDER}
      />

      <DetailItem
        title="Withdrawal period"
        value={
          bondDuration !== null
            ? `${bondDuration} ${pluralize('session', bondDuration !== 1)}`
            : EMPTY_VALUE_PLACEHOLDER
        }
        tooltip="The duration for which the deposited asset is locked."
      />
    </DetailsContainer>
  );
};

export default Details;
