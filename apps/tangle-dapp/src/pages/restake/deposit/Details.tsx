import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';
import { UseFormWatch } from 'react-hook-form';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeRewardConfig from '../../../data/restake/useRestakeRewardConfig';
import { DepositFormFields } from '../../../types/restake';
import useSessionDurationMs from '../../../data/useSessionDurationMs';
import formatMsDuration from '../../../utils/formatMsDuration';

type Props = {
  watch: UseFormWatch<DepositFormFields>;
};

const Details: FC<Props> = ({ watch }) => {
  const { vaults } = useRestakeContext();
  const { bondDuration } = useRestakeConsts();
  const rewardConfig = useRestakeRewardConfig();
  const sessionDurationMs = useSessionDurationMs();

  const assetId = watch('depositAssetId');

  const apy = useMemo(() => {
    if (assetId === null || rewardConfig === null) {
      return null;
    }

    const asset = vaults[assetId];

    if (asset === undefined || asset.vaultId === null) {
      return null;
    }

    return rewardConfig.get(asset.vaultId)?.apy ?? null;
  }, [assetId, vaults, rewardConfig]);

  const withdrawPeriod = useMemo(() => {
    if (sessionDurationMs === null || bondDuration === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * bondDuration);
  }, [bondDuration, sessionDurationMs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="APY"
        value={apy !== null ? `${apy}%` : EMPTY_VALUE_PLACEHOLDER}
      />

      <DetailItem
        title="Withdrawal delay"
        value={withdrawPeriod}
        tooltip="The duration for which the deposited asset is locked and can be withdrawn."
      />
    </DetailsContainer>
  );
};

export default Details;
