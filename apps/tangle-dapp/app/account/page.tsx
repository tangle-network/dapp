import { Card, Typography } from '@webb-tools/webb-ui-components';

import { TOKEN_UNIT } from '../../constants';
import AccountSummaryCard from './AccountSummaryCard';
import Actions from './Actions';

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-6">
        <AccountSummaryCard />

        <Actions />
      </div>

      <div className="flex">
        <Card className="space-y-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Typography variant="body1" fw="normal">
                Current Era
              </Typography>

              {/* <TimerLine /> */}
            </div>

            <Typography variant="h4" fw="bold">
              56
            </Typography>
          </div>
        </Card>

        <Card className="space-y-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Typography variant="body1" fw="normal">
                Total Rewards
              </Typography>

              {/* <TimerLine /> */}
            </div>

            <Typography variant="h4" fw="bold">
              50 {TOKEN_UNIT}
            </Typography>
          </div>
        </Card>

        <Card className="space-y-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Typography variant="body1" fw="normal">
                Claimed Amount
              </Typography>

              {/* <LoopIcon /> */}
            </div>

            <Typography variant="h4" fw="bold">
              10 {TOKEN_UNIT}
            </Typography>
          </div>
        </Card>

        <Card className="space-y-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Typography variant="body1" fw="normal">
                Pending Rewards
              </Typography>

              {/* <TimerLine /> */}
            </div>

            <Typography variant="h4" fw="bold">
              40 {TOKEN_UNIT}
            </Typography>
          </div>
        </Card>
      </div>
    </div>
  );
}
