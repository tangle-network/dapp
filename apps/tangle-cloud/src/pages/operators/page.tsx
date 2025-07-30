import OperatorsTableContainer from '@tangle-network/tangle-shared-ui/components/Restaking/OperatorsTableContainer';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
import { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import { FC, useCallback, useEffect, useState } from 'react';

const Page: FC = () => {
  const { result: delegatorInfo } = useRestakeDelegatorInfo();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOperatorJoined = useCallback(() => {
    setTimeout(() => {
      setRefreshTrigger((v) => v + 1);
    }, 2000);
  }, []);
  const {
    result: operatorMap,
    isLoading: isLoadingOperators,
    error: operatorMapError,
  } = useRestakeOperatorMap(refreshTrigger);
  const { operatorConcentration, operatorTvl } = useRestakeTvl(
    delegatorInfo as DelegatorInfo | null,
  );

  // TODO: Redirect to tangle-dapp restake/delegate page
  const handleRestakeClicked = useCallback(() => {
    console.log('Redirecting to restake/delegate page');
  }, []);

  useEffect(() => {
    if (operatorMapError) {
      console.error('Error fetching operator map:', operatorMapError);
    }
  }, [operatorMapError]);

  return (
    <div className="!mt-16">
      <OperatorsTableContainer
        onOperatorJoined={handleOperatorJoined}
        operatorConcentration={operatorConcentration}
        operatorMap={operatorMap}
        operatorTvl={operatorTvl}
        onRestakeClicked={handleRestakeClicked}
        onRestakeClickedPagePath=""
        onRestakeClickedQueryParamKey=""
        isLoading={isLoadingOperators}
      />
    </div>
  );
};

export default Page;
