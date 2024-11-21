import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const TxInfo = () => {
  const { delegationBondLessDelay } = useRestakeConsts();

  // TODO: Add fee value.
  return (
    <DetailsContainer>
      <DetailItem title="Fee" value={EMPTY_VALUE_PLACEHOLDER} />

      <DetailItem
        title="Unstake Period"
        value={
          typeof delegationBondLessDelay === 'number'
            ? `${delegationBondLessDelay} sessions`
            : EMPTY_VALUE_PLACEHOLDER
        }
      />
    </DetailsContainer>
  );
};

export default TxInfo;
