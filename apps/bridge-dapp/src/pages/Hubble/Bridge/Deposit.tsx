import { ArrowRight } from '@webb-tools/icons';
import {
  Button,
  FeeDetails,
  TransactionInputCard,
} from '@webb-tools/webb-ui-components';
import BridgeTabsContainer from '../../../containers/BridgeTabsContainer';

const Deposit = () => {
  return (
    <BridgeTabsContainer>
      <div className="flex flex-col space-y-6 grow">
        <div className="space-y-2">
          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body />
          </TransactionInputCard.Root>

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body />
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between grow">
          <FeeDetails />

          <Button isFullWidth>Deposit</Button>
        </div>
      </div>
    </BridgeTabsContainer>
  );
};

export default Deposit;
