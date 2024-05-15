import { Typography } from '@webb-tools/webb-ui-components';
import { BRIDGE_URL } from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';

export const ConnectWalletMobileContent: FC = () => {
  return (
    <>
      <Typography variant="body1">
        A complete mobile experience for Hubble Bridge is in the works. For now,
        enjoy all features on a desktop device.
      </Typography>
      <Typography variant="body1">
        Visit the link on desktop below to start transacting privately!
      </Typography>
      <Typography
        variant="body1"
        className="text-[#3D7BCE] dark:text-[#81B3F6]"
      >
        {BRIDGE_URL}
      </Typography>
    </>
  );
};
