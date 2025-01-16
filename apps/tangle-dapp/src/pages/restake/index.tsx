import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import RestakeOverviewTabs from '../../containers/restaking/RestakeOverviewTabs';
import { useParams } from 'react-router';
import { RestakeAction } from '../../constants';
import NotFoundPage from '../notFound';
import isEnumValue from '../../utils/isEnumValue';
import { FC } from 'react';

const RestakePage: FC = () => {
  const { action } = useParams();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const { delegatorTVL, operatorConcentration, operatorTVL, vaultTVL } =
    useRestakeTVL(operatorMap, delegatorInfo);

  // If provided, make sure that the action parameter is valid.
  if (action !== undefined && !isEnumValue(action, RestakeAction)) {
    return <NotFoundPage />;
  }

  return (
    <RestakeOverviewTabs
      delegatorTVL={delegatorTVL}
      operatorMap={operatorMap}
      delegatorInfo={delegatorInfo}
      operatorTVL={operatorTVL}
      vaultTVL={vaultTVL}
      operatorConcentration={operatorConcentration}
      action={action ?? RestakeAction.DEPOSIT}
    />
  );
};

export default RestakePage;
