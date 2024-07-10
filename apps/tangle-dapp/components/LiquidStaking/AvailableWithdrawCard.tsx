import { CheckboxCircleFill, TimeLineIcon, UndoIcon } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC, ReactElement } from 'react';

import GlassCard from '../GlassCard';

const AvailableWithdrawCard: FC = () => {
  return (
    <GlassCard className="flex rounded-xl gap-2">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <Typography variant="body1" fw="semibold">
            Available
          </Typography>

          <Typography variant="h5" fw="bold">
            0.0 DOT
          </Typography>
        </div>

        <div className="flex gap-1 items-center justify-center">
          <Button variant="utility" size="sm">
            Withdraw
          </Button>

          {/* TODO: Need a tooltip for this, since it's only an icon. */}
          <Button variant="utility" size="sm">
            <UndoIcon className="dark:fill-blue-40" />
          </Button>
        </div>
      </div>

      <hr className="border-mono-0 dark:border-mono-160" />

      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <Typography variant="body1" fw="semibold">
            My requests
          </Typography>

          <div className="flex gap-2">
            <RequestItem
              icon={<CheckboxCircleFill className="fill-green-50" />}
              text="0"
            />

            <RequestItem
              icon={<TimeLineIcon className="fill-blue-50" />}
              text="1"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          <TimeLineIcon className="dark:fill-mono-0" />

          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            1.00 tgDOT
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
};

type RequestItemProps = {
  icon: ReactElement;
  text: string;
};

/** @internal */
const RequestItem: FC<RequestItemProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {icon}

      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        {text}
      </Typography>
    </div>
  );
};

export default AvailableWithdrawCard;
