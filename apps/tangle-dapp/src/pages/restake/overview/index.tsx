import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import TableTabs from './TableTabs';
import { useParams } from 'react-router';
import { RestakeAction } from '../../../constants';
import NotFoundPage from '../../notFound';
import isEnumValue from '../../../utils/isEnumValue';

export default function RestakePage() {
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
    <TableTabs
      delegatorTVL={delegatorTVL}
      operatorMap={operatorMap}
      delegatorInfo={delegatorInfo}
      operatorTVL={operatorTVL}
      vaultTVL={vaultTVL}
      operatorConcentration={operatorConcentration}
      action={action ?? RestakeAction.DEPOSIT}
    />
  );
}
