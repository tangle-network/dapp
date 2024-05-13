'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import AddressInput, {
  AddressType,
} from '../../components/AddressInput/AddressInput';
import AmountInput from '../../components/AmountInput/AmountInput';
import { useBridge } from '../../context/BridgeContext';
import ChainSelectors from './ChainSelectors';
import useActionButton from './useActionButton';

interface BridgeContainerProps {
  className?: string;
}

const BridgeContainer: FC<BridgeContainerProps> = ({ className }) => {
  const { destinationAddress, setDestinationAddress, amount, setAmount } =
    useBridge();
  const { buttonAction, buttonText, isLoading } = useActionButton();

  return (
    <div
      className={twMerge(
        'max-w-[640px] min-h-[580px] bg-mono-0 dark:bg-mono-190 p-8',
        'rounded-xl border border-mono-40 dark:border-mono-160',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        'flex flex-col',
        className
      )}
    >
      <div className="flex-1 w-full flex flex-col justify-between">
        <div className="space-y-8">
          {/* Chain Dropdowns */}
          <ChainSelectors />

          <AmountInput
            id="bridge-amount-input"
            title="Amount"
            amount={amount}
            setAmount={setAmount}
            baseInputOverrides={{
              isFullWidth: true,
            }}
            placeholder=""
          />

          <AddressInput
            id="bridge-destination-address-input"
            type={AddressType.Both}
            title="Receiver Address"
            baseInputOverrides={{ isFullWidth: true }}
            value={destinationAddress}
            setValue={setDestinationAddress}
          />

          {/* TODO: Tx Info (Fees & Estimated Time) */}
        </div>
        <Button
          isFullWidth
          isDisabled={isLoading}
          isLoading={isLoading}
          onClick={buttonAction}
          loadingText="Connecting..."
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default BridgeContainer;
