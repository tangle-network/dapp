'use client';

import { ArrowRight } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import AddressInput, {
  AddressType,
} from '../../components/AddressInput/AddressInput';
import AmountInput from '../../components/AmountInput/AmountInput';
import { BRIDGE_SUPPORTED_CHAINS } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';
import ChainSelector from './ChainSelector';

interface BridgeContainerProps {
  className?: string;
}

const BridgeContainer: FC<BridgeContainerProps> = ({ className }) => {
  const {
    sourceChain,
    setSourceChain,
    destinationChain,
    setDestinationChain,
    destinationAddress,
    setDestinationAddress,
    amount,
    setAmount,
    isLoading,
  } = useBridge();

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
        <div className="space-y-6">
          {/* Chain Dropdowns */}
          <div className="flex justify-between items-center gap-3">
            <ChainSelector
              title="From"
              selectedChain={sourceChain}
              chainOptions={BRIDGE_SUPPORTED_CHAINS}
              onSelectChain={setSourceChain}
              className="flex-1"
            />

            <div>
              <ArrowRight size="lg" />
            </div>

            <ChainSelector
              title="To"
              selectedChain={destinationChain}
              chainOptions={BRIDGE_SUPPORTED_CHAINS}
              onSelectChain={setDestinationChain}
              className="flex-1"
            />
          </div>

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

          {/* Tx Info (Fees & Estimated Time) */}
        </div>
        <Button isFullWidth isDisabled={isLoading}>
          Connect Wallet
        </Button>
      </div>
    </div>
  );
};

export default BridgeContainer;
