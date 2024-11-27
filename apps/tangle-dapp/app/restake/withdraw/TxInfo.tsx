import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';

import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const TxInfo = () => {
  const { leaveDelegatorsDelay } = useRestakeConsts();

  return (
    <DetailsContainer>
      {/* TODO: Add fee value */}
      <DetailItem title="Fee" value={EMPTY_VALUE_PLACEHOLDER} />

      <DetailItem
        title="Withdraw delay"
        value={
          isDefined(leaveDelegatorsDelay)
            ? `${leaveDelegatorsDelay} rounds`
            : leaveDelegatorsDelay
        }
      />
    </DetailsContainer>
  );
};

export default TxInfo;
