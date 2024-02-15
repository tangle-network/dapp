import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import {
  NodeSpecificationsTableContainer,
  ServiceTablesContainer,
} from '../../../containers';
import ValidatorOverviewCard from './ValidatorOverviewCard';

export default function Index({
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
      <div className="flex gap-5">
        <ValidatorOverviewCard
          validatorAddress={validatorAddress}
          className="flex-1"
        />
        <div className="flex-1"></div>
      </div>

      <NodeSpecificationsTableContainer validatorAddress={validatorAddress} />

      <ServiceTablesContainer validatorAddress={validatorAddress} />
    </div>
  );
}
