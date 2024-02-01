import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import {
  NodeSpecificationsTableContainer,
  ServiceTablesContainer,
} from '../../../containers';

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

      <NodeSpecificationsTableContainer validatorAddress={validatorAddress} />

      <ServiceTablesContainer validatorAddress={validatorAddress} />
    </div>
  );
}
