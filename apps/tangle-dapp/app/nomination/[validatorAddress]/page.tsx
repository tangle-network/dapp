import { isAddress } from '@polkadot/util-crypto';
import { notFound } from 'next/navigation';

import { NodeSpecificationsTableContainer } from '../../../containers';

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
    <div className="my-5">
      <div>
        {/* Validator Card */}

        {/* Role  */}
      </div>

      <NodeSpecificationsTableContainer validatorAddress={validatorAddress} />

      {/* Services */}
    </div>
  );
}
