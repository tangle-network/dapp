import {
  BlockIcon,
  CoinIcon,
  HelpLineIcon,
  SosLineIcon,
} from '@webb-tools/icons';
import {
  Button,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';

import { DepositContainer } from '../containers/DepositContainer';
import { TransferContainer } from '../containers/TransferContainer';
import { WithdrawContainer } from '../containers/WithdrawContainer';

const PageBridge = () => {
  return (
    <div className="w-full mt-6">
      <div className="flex items-start space-x-6">
        {/** Bridge tabs */}
        <div className="max-w-[550px] bg-mono-0 dark:bg-mono-180 p-4 rounded-lg space-y-4 grow">
          <TabsRoot defaultValue="deposit">
            <TabsList aria-label="bridge action" className="mb-4">
              <TabTrigger value="deposit">Deposit</TabTrigger>
              <TabTrigger value="transfer">Transfer</TabTrigger>
              <TabTrigger value="withdraw">Withdraw</TabTrigger>
            </TabsList>
            <TabContent value="deposit">
              <DepositContainer />
            </TabContent>
            <TabContent value="transfer">
              <TransferContainer />
            </TabContent>
            <TabContent value="withdraw">
              <WithdrawContainer />
            </TabContent>
          </TabsRoot>
        </div>

        {/** Education cards */}
        <div className="p-9 max-w-[386px] bg-blue-10 dark:bg-blue-120 rounded-lg">
          <Typography
            variant="body1"
            fw="semibold"
            className="text-blue-70 dark:text-blue-50"
          >
            Learn about what makes Webb private and how this makes using it
            different from other bridges.
          </Typography>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              leftIcon={<CoinIcon size="lg" className="!fill-current" />}
              href="https://docs.webb.tools" // TODO: Determine link here
              target="_blank"
              variant="link"
            >
              Usage Guide
            </Button>

            <Button
              leftIcon={<BlockIcon size="lg" className="!stroke-current" />}
              href="https://docs.webb.tools" // TODO: Determine link here
              target="_blank"
              variant="link"
            >
              FAQ
            </Button>

            <Button
              leftIcon={<HelpLineIcon size="lg" className="!fill-current" />}
              href="https://docs.webb.tools"
              target="_blank"
              variant="link"
            >
              Get Started
            </Button>

            <Button
              leftIcon={<SosLineIcon size="lg" className="!fill-current" />}
              href="https://t.me/webbprotocol"
              target="_blank"
              variant="link"
            >
              Support
            </Button>
          </div>
        </div>
      </div>

      {/** Account stats table */}

      {/** Last login */}
    </div>
  );
};

export default PageBridge;
