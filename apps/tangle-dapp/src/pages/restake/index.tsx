import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
import RestakeOverviewTabs from '../../containers/restaking/RestakeOverviewTabs';
import { PagePath } from '../../types';
import { RestakeAction } from '../../constants';
import { Navigate, useParams } from 'react-router';
import isEnumValue from '../../utils/isEnumValue';
import { FC, useCallback, useState } from 'react';

const RestakePage: FC = () => {
  const { action } = useParams();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { result: operatorMap } = useRestakeOperatorMap(refreshTrigger);

  const { operatorConcentration, operatorTvl } = useRestakeTvl(delegatorInfo);

  const handleOperatorJoined = useCallback(() => {
    setTimeout(() => {
      setRefreshTrigger((v) => v + 1);
    }, 2000);
  }, []);

  // If provided, make sure that the action parameter is valid.
  if (action !== undefined && !isEnumValue(RestakeAction, action)) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (action === undefined) {
    return <Navigate to={PagePath.RESTAKE_DEPOSIT} />;
  }

  return (
    <div className="space-y-7">
      <RestakeOverviewTabs
        operatorMap={operatorMap}
        operatorTVL={operatorTvl}
        operatorConcentration={operatorConcentration}
        action={action as RestakeAction}
        onOperatorJoined={handleOperatorJoined}
      />
    </div>
  );
};

export default RestakePage;
