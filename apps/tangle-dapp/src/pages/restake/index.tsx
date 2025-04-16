import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl2';
import { FC } from 'react';
import { Navigate, useParams } from 'react-router';
import { RestakeAction } from '../../constants';
import RestakeOverviewTabs from '../../containers/restaking/RestakeOverviewTabs';
import { PagePath } from '../../types';
import isEnumValue from '../../utils/isEnumValue';

const RestakePage: FC = () => {
  const { action } = useParams();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { result: operatorMap } = useRestakeOperatorMap();

  const { operatorConcentration, operatorTvl } = useRestakeTvl(delegatorInfo);

  // If provided, make sure that the action parameter is valid.
  if (action !== undefined && !isEnumValue(action, RestakeAction)) {
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
        action={action}
      />
    </div>
  );
};

export default RestakePage;
