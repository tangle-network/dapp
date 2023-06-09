import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { MetaMaskIcon } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
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
import { useCallback, useMemo } from 'react';

import FaucetError from '../errors/FaucetError';
import failedAnimation from '../lottie/failed.json';
import processingAnimation from '../lottie/processing.json';
import sucessAnimation from '../lottie/success.json';
import { useFaucetContext } from '../provider';
import addTokenToMetamask from '../utils/addTokenToMetamask';

const ProcessingModal = () => {
  const {
    isMintingModalOpen$,
    isMintingSuccess$,
    inputValues$,
    mintTokenResult$,
  } = useFaucetContext();

  const inputValues = useObservableState(inputValues$);

  const isModalOpen = useObservableState(isMintingModalOpen$);
  const isSuccess = useObservableState(isMintingSuccess$);

  const mintTokenRes = useObservableState(mintTokenResult$);

  const txErrorMessage = useMemo(() => {
    if (!FaucetError.isFaucetError(mintTokenRes)) return '';

    return mintTokenRes.message;
  }, [mintTokenRes]);

  const animationData = useMemo(
    () =>
      isSuccess
        ? sucessAnimation
        : txErrorMessage // If there is an error, use the failed animation
        ? failedAnimation
        : processingAnimation,
    [isSuccess, txErrorMessage]
  );

  const mintTxLink = useMemo(() => {
    if (!mintTokenRes) return '';

    if (FaucetError.isFaucetError(mintTokenRes)) return '';

    const {
      tx_result: { Evm: txReceipt, Substrate: txHash },
      typed_chain_id: { Evm: evmChainId, Substrate: substrateChainId },
    } = mintTokenRes;

    let typedChainId: number;

    if (substrateChainId) {
      typedChainId = calculateTypedChainId(
        ChainType.Substrate,
        substrateChainId
      );
    } else if (evmChainId) {
      typedChainId = calculateTypedChainId(ChainType.EVM, evmChainId);
    } else {
      alert('No chain id found in the mint token result');
      return '';
    }

    const chain = chainsConfig[typedChainId];

    if (!chain) {
      alert(`Typed chain id ${typedChainId} is not in the chains config`);
      return '';
    }

    if (!chain.blockExplorerStub) {
      alert(`Chain ${chain.name} does not have a block explorer url`);
      return '';
    }

    if (txReceipt) {
      return `${chain.blockExplorerStub}/tx/${txReceipt.transactionHash}`;
    } else if (txHash) {
      alert(`Substrate tx hash ${txHash} is not supported yet`);
      return '';
    } else {
      alert('No tx hash found in the mint token result');
      return '';
    }
  }, [mintTokenRes]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Only close the modal when the minting is successful or failed
      if ((isSuccess || txErrorMessage) && !nextOpen) {
        isMintingModalOpen$.next(nextOpen);
      } else {
        isMintingModalOpen$.next(true);
      }
    },
    [isMintingModalOpen$, isSuccess, txErrorMessage]
  );

  const handleCloseAutoFocus = useCallback(() => {
    isMintingSuccess$.next(false);
    mintTokenResult$.next(null);
  }, [isMintingSuccess$, mintTokenResult$]);

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
          <Lottie
            className={cx(txErrorMessage ? 'lottie-size-sm' : 'lottie-size')}
            animationData={animationData}
          />

          <Typography fw="bold" ta="center" variant="h5">
            {isSuccess
              ? 'Transfer Successful'
              : txErrorMessage
              ? 'Transfer Failed'
              : 'Request in Progress'}
          </Typography>

          <Typography fw="semibold" ta="center" variant="body1">
            {isSuccess
              ? 'This transfer has been made to your wallet address.'
              : txErrorMessage
              ? txErrorMessage
              : 'Your request is in progress. It may take up to a few seconds to complete the request.'}
          </Typography>

          <Button
            href={mintTxLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cx({ hidden: !isSuccess })}
            variant="link"
          >
            View on Explorer
          </Button>
        </div>

        {/* Hide the footer while transaction is in-progress */}
        <ModalFooter className={cx({ hidden: !isSuccess && !txErrorMessage })}>
          {isSuccess ? (
            <Button
              rightIcon={<MetaMaskIcon size="lg" />}
              onClick={handleAddTokenToMetamask}
              isFullWidth
              variant="secondary"
            >
              Add token to Metamask
            </Button>
          ) : (
            <Button
              onClick={() => handleOpenChange(false)}
              isFullWidth
              variant="secondary"
            >
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProcessingModal;
