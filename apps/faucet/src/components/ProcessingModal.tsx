import { MetaMaskIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import Lottie from 'lottie-react';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo } from 'react';

import processingAnimation from '../lottie/processing.json';
import sucessAnimation from '../lottie/success.json';
import { useFaucetContext } from '../provider';
import addTokenToMetamask from '../utils/addTokenToMetamask';

const ProcessingModal = () => {
  const { isMintingModalOpen$, isMintingSuccess$, inputValues$ } =
    useFaucetContext();

  const inputValues = useObservableState(inputValues$);

  const isModalOpen = useObservableState(isMintingModalOpen$);
  const isSuccess = useObservableState(isMintingSuccess$);

  const animationData = useMemo(
    () => (isSuccess ? sucessAnimation : processingAnimation),
    [isSuccess]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Only close the modal when the minting is successful
      if (isSuccess && !nextOpen) {
        isMintingModalOpen$.next(nextOpen);
      } else {
        isMintingModalOpen$.next(true);
      }
    },
    [isMintingModalOpen$, isSuccess]
  );

  const handleCloseAutoFocus = useCallback(
    () => isMintingSuccess$.next(false),
    [isMintingSuccess$]
  );

  const handleAddTokenToMetamask = useCallback(() => {
    const input = {
      address: inputValues.contractAddress ?? '',
      decimals: 18,
      image: '',
      symbol: inputValues.token ?? '',
    };

    addTokenToMetamask(input);
  }, [inputValues]);

  return (
    <Modal open={isModalOpen}>
      <ModalContent
        onCloseAutoFocus={handleCloseAutoFocus}
        className="bg-mono-0 rounded-xl w-modal"
        isOpen={isModalOpen}
        isCenter
      >
        <ModalHeader onClose={() => handleOpenChange(false)} />

        <div className="flex flex-col items-center space-y-4 p-9">
          <Lottie className="lottie-size" animationData={animationData} />

          <Typography fw="bold" ta="center" variant="h5">
            {isSuccess ? 'Transfer Successful' : 'Request in Progress'}
          </Typography>

          <Typography fw="semibold" ta="center" variant="body1">
            {isSuccess
              ? 'This transfer has been made to your wallet address.'
              : 'Your request is in progress. It may take up to a few seconds to complete the request.'}
          </Typography>

          <Button className={cx({ hidden: !isSuccess })} variant="link">
            View on Explorer
          </Button>
        </div>

        <ModalFooter className={cx({ hidden: !isSuccess })}>
          <Button
            rightIcon={<MetaMaskIcon size="lg" />}
            onClick={handleAddTokenToMetamask}
            isFullWidth
            variant="secondary"
          >
            Add token to Metamask
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProcessingModal;
