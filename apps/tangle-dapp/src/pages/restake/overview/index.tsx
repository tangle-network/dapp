import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@webb-tools/tangle-shared-ui/data/restake/useRestakeTVL';
import TableTabs from './TableTabs';
import { useParams } from 'react-router';
import { RestakeAction } from '../../../constants';
import NotFoundPage from '../../notFound';
import isEnumValue from '../../../utils/isEnumValue';
import RestakeBanner from '@webb-tools/tangle-shared-ui/components/blueprints/RestakeBanner';
import { OPERATOR_JOIN_DOCS_LINK } from '@webb-tools/webb-ui-components/constants/tangleDocs';

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
    <div className="space-y-9">
      <RestakeBanner
        title="Introducing: Tangle Operators"
        description="Ready to participate on Tangle? Join as an operator to provide on-demand services and earn rewards."
        buttonHref={OPERATOR_JOIN_DOCS_LINK}
        buttonText="Get Started"
      />

      <TableTabs
        delegatorTVL={delegatorTVL}
        operatorMap={operatorMap}
        delegatorInfo={delegatorInfo}
        operatorTVL={operatorTVL}
        vaultTVL={vaultTVL}
        operatorConcentration={operatorConcentration}
        action={action ?? RestakeAction.DEPOSIT}
      />
    </div>
  );
}
