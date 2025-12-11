import { FC, useCallback, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import RestakeOverviewTabs from '../../containers/restaking/RestakeOverviewTabs';
import { PagePath } from '../../types';
import { RestakeAction } from '../../constants';
import isEnumValue from '../../utils/isEnumValue';

// EVM hooks
import { useOperatorMap } from '@tangle-network/tangle-shared-ui/data/graphql';

const RestakePage: FC = () => {
  const { action } = useParams();
  const [_refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch operators using v2 GraphQL hook
  const { data: operatorMap, refetch: refetchOperators } = useOperatorMap();

  const handleOperatorJoined = useCallback(() => {
    setTimeout(() => {
      refetchOperators();
      setRefreshTrigger((v) => v + 1);
    }, 2000);
  }, [refetchOperators]);

  // If provided, make sure that the action parameter is valid.
  if (action !== undefined && !isEnumValue(RestakeAction, action)) {
    return <Navigate to={PagePath.NOT_FOUND} />;
  } else if (action === undefined) {
    return <Navigate to={PagePath.RESTAKE_DEPOSIT} />;
  }

  return (
    <div className="space-y-7">
      <RestakeOverviewTabs
        operatorMap={operatorMap ?? null}
        action={action as RestakeAction}
        onOperatorJoined={handleOperatorJoined}
      />
    </div>
  );
};

export default RestakePage;
