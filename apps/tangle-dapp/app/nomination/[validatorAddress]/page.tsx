import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import InfoCard from './InfoCard';
import NodeSpecificationsTable from './NodeSpecificationsTable';
import ServiceTableTabs from './ServiceTableTabs';

// TODO: might need to add metadata here

export default function ValidatorDetails({
  params,
}: {
  params: { validatorAddress: string };
}) {
  const { validatorAddress } = params;

  if (!isAddress(validatorAddress)) {
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

      <ServiceTableTabs validatorAddress={validatorAddress} />
    </div>
  );
}
