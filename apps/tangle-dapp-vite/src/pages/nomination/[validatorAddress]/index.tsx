import { isAddress } from '@polkadot/util-crypto';
import { useParams } from 'react-router';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import InfoCard from './InfoCard';
import NodeSpecificationsTable from './NodeSpecificationsTable';

export default function ValidatorDetailsPage() {
  const { validatorAddress } = useParams();

  if (!isAddress(validatorAddress)) {
    // TODO: Redirect to 404 page
    return null;
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
