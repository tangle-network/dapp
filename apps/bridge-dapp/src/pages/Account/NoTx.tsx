import { type FC } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { TimerLine } from '@webb-tools/icons';

const NoTx: FC = () => {
  return (
    <div className="h-[325px] bg-mono-0 dark:bg-mono-180 flex items-center justify-center rounded-2xl px-6">
      <div className="flex flex-col gap-2 items-center">
        <TimerLine size="lg" />
        <Typography variant="h5" fw="bold" ta="center">
          Your transaction history will appear here.
        </Typography>
        <Typography variant="body1" ta="center">
          Either you have not made any transactions yet, or your transaction
          history has been deleted.
        </Typography>
      </div>
    </div>
  );
};

export default NoTx;
