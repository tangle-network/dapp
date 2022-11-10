import { TransactionState } from '@webb-tools/dapp-types';
import {
  BlockIcon,
  CoinIcon,
  HelpLineIcon,
  SosLineIcon,
} from '@webb-tools/icons';
import { useBridgeDeposit } from '@webb-tools/react-hooks';
import {
  Button,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  TransactionPayload,
  TransactionQueueCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useEffect, useMemo, useState } from 'react';

import { DepositContainer } from '../containers/DepositContainer';
import { TransferContainer } from '../containers/TransferContainer';
import { WithdrawContainer } from '../containers/WithdrawContainer';
import { getMessageFromTransactionState } from '../utils';

const PageBridge = () => {
  const { customMainComponent } = useWebbUI();
  const { stage, setStage } = useBridgeDeposit();

  const defaultTx: Partial<TransactionPayload> = useMemo(() => {
    return {
      id: '1',
      getExplorerURI(addOrTxHash, variant) {
        return '#';
      },
      onDetails: () => {
        console.log('On detail');
      },
      onDismiss: () => {
        setStage(TransactionState.Ideal);
      },
    }
  }, [setStage]);

  const [txPayload, setTxPayload] = useState(defaultTx);

  useEffect(() => {
    const message = getMessageFromTransactionState(stage);

    if (message.length) {
      setTxPayload((prev) => ({
        ...prev,
        txStatus: {
          ...prev.txStatus,
          message: `${message}...`,
        },
      }));
    }

    if (stage === TransactionState.Done) {
      setTxPayload((prev) => ({
        ...prev,
        txStatus: {
          ...prev.txStatus,
          status: 'completed',
        },
      }));
    }

    if (stage === TransactionState.Failed) {
      setTxPayload((prev) => ({
        ...prev,
        txStatus: {
          ...prev.txStatus,
          status: 'warning',
        },
      }));
    }

    if (stage === TransactionState.Ideal) {
      setTxPayload(defaultTx);
    }
  }, [defaultTx, stage]);

  const isDepositing = useMemo(() => stage !== TransactionState.Ideal, [stage]);

  return (
    <div className="w-full mt-6">
      <div className="flex items-start space-x-4">
        {customMainComponent}

        {/** Bridge tabs */}
        <TabsRoot
          defaultValue="deposit"
          // The customMainComponent alters the global mainComponent for display.
          // Therfore, if the customMainComponent exists (input selected) then hide the base component.
          className={cx(
            'max-w-[550px] bg-mono-0 dark:bg-mono-180 p-4 rounded-lg space-y-4 grow',
            customMainComponent ? 'hidden' : 'block'
          )}
        >
          <TabsList aria-label="bridge action" className="mb-4">
            <TabTrigger value="deposit">Deposit</TabTrigger>
            <TabTrigger value="transfer">Transfer</TabTrigger>
            <TabTrigger value="withdraw">Withdraw</TabTrigger>
          </TabsList>
          <TabContent value="deposit">
            <DepositContainer setTxPayload={setTxPayload} />
          </TabContent>
          <TabContent value="transfer">
            <TransferContainer />
          </TabContent>
          <TabContent value="withdraw">
            <WithdrawContainer setTxPayload={setTxPayload} />
          </TabContent>
        </TabsRoot>

        <div>
          {/** Transaction Queue Card */}
          {isDepositing && (
            <TransactionQueueCard
              className="w-full mb-4 max-w-none"
              transactions={[txPayload as TransactionPayload]}
            />
          )}

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
      </div>

      {/** Account stats table */}

      {/** Last login */}
    </div>
  );
};

export default PageBridge;
