import { WalletLineIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const WalletBalance: FC = () => {
  return (
    <Typography
      variant="body1"
      fw="bold"
      className="flex gap-1 items-center dark:text-mono-80"
    >
      <WalletLineIcon /> 0.00
    </Typography>
  );
};

export default WalletBalance;
