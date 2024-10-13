'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import AddressInput, {
  AddressType,
} from '../../components/AddressInput/AddressInput';
import { useBridge } from '../../context/BridgeContext';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { isEVMChain } from '../../utils/bridge';
import AmountAndTokenInput from './AmountAndTokenInput';
import BridgeConfirmationModal from './BridgeConfirmationModal';
import ChainSelectors from './ChainSelectors';
import FeeDetails from './FeeDetails';
import useActionButton from './hooks/useActionButton';

interface BridgeContainerProps {
  className?: string;
}

const BridgeContainer: FC<BridgeContainerProps> = ({ className }) => {
  const {
    amount,
    selectedDestinationChain,
    destinationAddress,
    setDestinationAddress,
    setIsAddressInputError,
    isAmountInputError,
    isAddressInputError,
  } = useBridge();
  const activeAccountAddress = useActiveAccountAddress();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const {
    buttonAction,
    buttonText,
    buttonLoadingText,
    isLoading,
    isDisabled,
    // errorMessage,
  } = useActionButton({
    handleOpenConfirmModal: () => setIsConfirmModalOpen(true),
  });

  const hideFeeDetails = useMemo(
    () =>
      !activeAccountAddress ||
      !amount ||
      !destinationAddress ||
      isAmountInputError ||
      isAddressInputError,
    [
      activeAccountAddress,
      amount,
      destinationAddress,
      isAmountInputError,
      isAddressInputError,
    ],
  );

  return (
    <>
      <div
        className={twMerge(
          'max-w-[640px] min-h-[580px] bg-mono-0 dark:bg-mono-190 p-5 md:p-8',
          'rounded-xl border border-mono-40 dark:border-mono-160',
          'shadow-webb-lg dark:shadow-webb-lg-dark',
          'flex flex-col',
          className,
        )}
      >
        <div className="flex flex-col justify-between flex-1">
          <div className="flex flex-col gap-10">
            <ChainSelectors />

            <AmountAndTokenInput />

            <AddressInput
              id="bridge-destination-address-input"
              type={
                isEVMChain(selectedDestinationChain)
                  ? AddressType.EVM
                  : AddressType.Substrate
              }
              title="Receiver Address"
              baseInputOverrides={{ isFullWidth: true }}
              value={destinationAddress}
              setValue={setDestinationAddress}
              setErrorMessage={(error) =>
                setIsAddressInputError(error ? true : false)
              }
            />

            {!hideFeeDetails && <FeeDetails />}
          </div>

          <Button
            isFullWidth
            isDisabled={isDisabled}
            isLoading={isLoading}
            onClick={buttonAction}
            loadingText={buttonLoadingText}
          >
            {buttonText}
          </Button>
        </div>
      </div>

      <BridgeConfirmationModal
        isOpen={isConfirmModalOpen}
        handleClose={() => setIsConfirmModalOpen(false)}
      />
    </>
  );
};

export default BridgeContainer;
