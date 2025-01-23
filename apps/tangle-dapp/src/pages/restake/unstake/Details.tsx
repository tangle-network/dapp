import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components';
import DetailsContainer from '../../../components/DetailsContainer';
import DetailItem from '../../../components/LiquidStaking/stakeAndUnstake/DetailItem';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC } from 'react';

const Details: FC = () => {
  const { delegationBondLessDelay } = useRestakeConsts();

  // TODO: Add fee value.
  return (
    <DetailsContainer>
      <DetailItem
        title="Undelegate period"
        tooltip="Waiting time between scheduling and executing an undelegation"
        value={
          typeof delegationBondLessDelay === 'number'
            ? `${delegationBondLessDelay} ${pluralize('session', delegationBondLessDelay !== 1)}`
            : EMPTY_VALUE_PLACEHOLDER
        }
      />
    </DetailsContainer>
  );
};

export default Details;
