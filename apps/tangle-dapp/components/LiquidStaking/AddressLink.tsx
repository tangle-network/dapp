import { HexString } from '@polkadot/util/types';
import { ExternalLinkLine } from '@webb-tools/icons';
import { shortenString, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { AnySubstrateAddress } from '../../types/utils';

export type AddressLinkProps = {
  address: AnySubstrateAddress | HexString;
};

const AddressLink: FC<AddressLinkProps> = ({ address }) => {
  // TODO: Determine href.
  const href = '#';

  return (
    <a
      href={href}
      className="flex gap-1 items-center justify-start hover:underline"
    >
      <Typography variant="body1" fw="normal" className="dark:text-mono-0">
        {shortenString(address, 6)}
      </Typography>

      <ExternalLinkLine className="dark:fill-mono-0" />
    </a>
  );
};

export default AddressLink;
