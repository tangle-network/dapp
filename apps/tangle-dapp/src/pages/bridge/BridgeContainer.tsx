'use client';

import { Card } from '@webb-tools/webb-ui-components';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import AddressInput, { AddressType } from '../../components/AddressInput';
import { useBridge } from '../../context/BridgeContext';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import { isEVMChain } from '../../utils/bridge';
import AmountAndTokenInput from './AmountAndTokenInput';
import BridgeConfirmationModal from './BridgeConfirmationModal';
import ChainSelectors from './ChainSelectors';
import FeeDetails from './FeeDetails';
import useActionButton from './hooks/useActionButton';

type BridgeContainerProps = {
  className?: string;
};

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

  const { buttonAction, buttonText, buttonLoadingText, isLoading, isDisabled } =
    useActionButton({
      handleOpenConfirmModal: () => setIsConfirmModalOpen(true),
    });

  const hideFeeDetails =
    !activeAccountAddress ||
    !amount ||
    !destinationAddress ||
    isAmountInputError ||
    isAddressInputError;

  return (
    <>
      <Card
        withShadow
        className={twMerge(
          'flex flex-col gap-7 w-full max-w-[590px]',
          className,
        )}
      >
        <div className="flex flex-col gap-7">
          <ChainSelectors />

          <AmountAndTokenInput />

          <AddressInput
            id="bridge-destination-address-input"
            type={
              isEVMChain(selectedDestinationChain)
                ? AddressType.EVM
                : AddressType.Substrate
            }
            title="Recipient Address"
            wrapperOverrides={{
              isFullWidth: true,
              wrapperClassName: 'dark:bg-mono-180',
            }}
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
      </Card>

      <BridgeConfirmationModal
        isOpen={isConfirmModalOpen}
        handleClose={() => setIsConfirmModalOpen(false)}
      />
    </>
  );
};

export default BridgeContainer;
