import { FC } from 'react';
import Image from 'next/image';
import { Typography } from '@webb-tools/webb-ui-components';

import { shortenAddress } from '../../../utils';

export const AddressCell: FC<{ address: string }> = ({ address }) => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/static/svgs/webbAddress.svg"
        width={16}
        height={16}
        alt={address}
      />
      <Typography variant="mkt-body2" fw="bold">
        {shortenAddress(address)}
      </Typography>
    </div>
  );
};
