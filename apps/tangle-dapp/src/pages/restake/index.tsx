import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import { FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { RestakeAction } from '../../constants';
import RestakeOverviewTabs from '../../containers/restaking/RestakeOverviewTabs';
import { PagePath } from '../../types';
import isEnumValue from '../../utils/isEnumValue';
import NotFoundPage from '../notFound';

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
  if (action === undefined) {
    return <Navigate to={PagePath.RESTAKE_DEPOSIT} />;
  }

  return (
    <div className="space-y-7">
      <RestakeOverviewTabs
        delegatorTVL={delegatorTVL}
        operatorMap={operatorMap}
        delegatorInfo={delegatorInfo}
        operatorTVL={operatorTVL}
        vaultTVL={vaultTVL}
        operatorConcentration={operatorConcentration}
        action={action}
      />
    </div>
  );
};

export default RestakePage;
