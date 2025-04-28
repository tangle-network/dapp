import OperatorsTable from '../../containers/restaking/OperatorsTable';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
import { FC, useCallback, useEffect } from 'react';

const Page: FC = () => {
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const {
    result: operatorMap,
    isLoading: isLoadingOperators,
    error: operatorMapError,
  } = useRestakeOperatorMap();
  const { operatorConcentration, operatorTvl } = useRestakeTvl(delegatorInfo);

  const handleRestakeClicked = useCallback(() => {
    console.log('Restake clicked');
  }, []);

  useEffect(() => {
    if (operatorMapError) {
      console.error('Error fetching operator map:', operatorMapError);
    }
  }, [operatorMapError]);

  return (
    <div>
      <OperatorsTable
        operatorConcentration={operatorConcentration}
        operatorMap={operatorMap}
        operatorTvl={operatorTvl}
        onRestakeClicked={handleRestakeClicked}
        isLoading={isLoadingOperators}
      />
    </div>
  );
};

export default Page;
