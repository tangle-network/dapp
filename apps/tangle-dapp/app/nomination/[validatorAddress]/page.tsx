import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import NodeSpecificationsTable from './NodeSpecificationsTable';
import ServiceTableTabs from './ServiceTableTabs';

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
      <NodeSpecificationsTable validatorAddress={validatorAddress} />

      <ServiceTableTabs validatorAddress={validatorAddress} />
    </div>
  );
}
