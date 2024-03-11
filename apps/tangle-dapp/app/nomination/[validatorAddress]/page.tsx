import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import NodeSpecificationsTable from './NodeSpecificationsTable';
import RoleDistributionCard from './RoleDistributionCard';
import ServiceTableTabs from './ServiceTableTabs';
import ValidatorOverviewCard from './ValidatorOverviewCard';

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
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        <ValidatorOverviewCard
          validatorAddress={validatorAddress}
          className="flex-1"
        />
        <RoleDistributionCard
          validatorAddress={validatorAddress}
          className="flex-1"
        />
      </div>

      <NodeSpecificationsTable validatorAddress={validatorAddress} />

      <ServiceTableTabs validatorAddress={validatorAddress} />
    </div>
  );
}
