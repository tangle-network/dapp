import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components';
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
  const { assets } = useRestakeContext();
  const { leaveDelegatorsDelay } = useRestakeConsts();
  const rewardConfig = useRestakeRewardConfig();
  const sessionDurationMs = useSessionDurationMs();

  const assetId = watch('depositAssetId');

  const apy = useMemo(() => {
    if (assetId === null || rewardConfig === null) {
      return null;
    }

    const asset = assets?.get(assetId);

    if (asset === undefined || asset.metadata.vaultId === null) {
      return null;
    }

    return rewardConfig.get(asset.metadata.vaultId)?.apy ?? null;
  }, [assetId, assets, rewardConfig]);

  const withdrawPeriod = useMemo(() => {
    if (sessionDurationMs === null || leaveDelegatorsDelay === null) {
      return null;
    }

    return formatMsDuration(sessionDurationMs * leaveDelegatorsDelay);
  }, [leaveDelegatorsDelay, sessionDurationMs]);

  return (
    <DetailsContainer>
      <DetailItem
        title="APY"
        value={apy !== null ? `${apy}%` : EMPTY_VALUE_PLACEHOLDER}
      />

      <DetailItem
        title="Withdrawal period"
        tooltip="Waiting time between scheduling and executing a withdrawal"
        value={withdrawPeriod}
      />
    </DetailsContainer>
  );
};

export default Details;
