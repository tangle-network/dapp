import { isSubstrateAddress } from '@webb-tools/webb-ui-components';
import { notFound } from 'next/navigation';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import InfoCard from './InfoCard';
import NodeSpecificationsTable from './NodeSpecificationsTable';

export default function ValidatorDetailsPage() {
  const { validatorAddress } = useParams();

  if (!isSubstrateAddress(validatorAddress)) {
    notFound();
  }

  return (
    <div className="my-5 space-y-10">
      <div className="flex flex-col items-stretch gap-5 lg:flex-row">
        <InfoCard validatorAddress={validatorAddress} className="flex-1" />
      </div>

      {/* TODO: Hide this for now */}
      {!IS_PRODUCTION_ENV && (
        <NodeSpecificationsTable validatorAddress={validatorAddress} />
      )}
    </div>
  );
}
