import getExplorerURI from '@webb-tools/api-provider-environment/transaction/utils/getExplorerURI';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import isValidUrl from '@webb-tools/dapp-types/utils/isValidUrl';
import { MetaMaskIcon, WalletLineIcon } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import {
  Button,
  KeyValueWithButton,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  populateDocsUrl,
  Typography,
} from '@webb-tools/webb-ui-components';
import {
  BRIDGE_URL,
  GITHUB_BUG_REPORT_URL,
  WEBB_DOC_ROUTES_RECORD,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Lottie from 'lottie-react';
import { useObservableState } from 'observable-hooks';
import { type ComponentProps, type FC, useCallback, useMemo } from 'react';

import FaucetError from '../errors/FaucetError';
import failedAnimation from '../lottie/failed.json';
import processingAnimation from '../lottie/processing.json';
import successAnimation from '../lottie/success.json';
import { useFaucetContext } from '../provider';
import type { MintTokenBody, MintTokenResult } from '../types';
import addTokenToMetamask from '../utils/addTokenToMetamask';
import parseErrorFromResult from '../utils/parseErrorFromResult';

const sharedExternalLinkProps = {
  rel: 'noopener noreferrer',
  target: '_blank',
} satisfies ComponentProps<'a'>;

const ProcessingModal: FC = () => {
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

  const isFailed = useMemo(() => {
    if (!FaucetError.isFaucetError(mintTokenRes)) return false;

    return true;
  }, [mintTokenRes]);

  const animationData = useMemo(
    () =>
      isSuccess
        ? successAnimation
        : isFailed // If there is an error, use the failed animation
        ? failedAnimation
        : processingAnimation,
    [isSuccess, isFailed]
  );

  const errorMessage = useMemo(
    () => parseErrorFromResult(mintTokenRes),
    [mintTokenRes]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      // Only close the modal when the minting is successful or failed
      if ((isSuccess || isFailed) && !nextOpen) {
        isMintingModalOpen$.next(nextOpen);
      } else {
        isMintingModalOpen$.next(true);
      }
    },
    [isMintingModalOpen$, isSuccess, isFailed]
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
        className={cx(
          'bg-mono-0 dark:bg-mono-160 rounded-xl !w-full md:!w-[500px]',
          'top-auto bottom-0 md:-translate-x-1/2 md:-translate-y-1/2 md:top-1/2 md:bottom-auto md:left-1/2'
        )}
        isOpen={isModalOpen}
      >
        <ModalHeader onClose={() => handleOpenChange(false)} />

        <div className="flex flex-col items-center space-y-4 p-9">
          <Lottie
            className={cx(isFailed ? 'lottie-size-sm' : 'lottie-size')}
            animationData={animationData}
          />

          <Typography
            fw="black"
            ta="center"
            variant="h5"
            className="!text-[24px] !leading-[40px]"
          >
            {isSuccess
              ? 'Transfer Successful'
              : isFailed
              ? 'Transfer Failed'
              : 'Request in Progress'}
          </Typography>

          <Typography fw="semibold" ta="center" variant="body1">
            {isSuccess
              ? getSuccessMessage()
              : isFailed
              ? errorMessage
              : 'Your request is in progress. It may take up to a few seconds to complete the request.'}
          </Typography>

          <MintTxLinkOrHash mintTokenResult={mintTokenRes} />
        </div>

        {/* Hide the footer while transaction is in-progress */}
        <ModalFooter className={cx({ hidden: !isSuccess && !isFailed })}>
          {isSuccess ? (
            <>
              <Button
                {...sharedExternalLinkProps}
                href={BRIDGE_URL}
                isFullWidth
              >
                Hubble Bridge
              </Button>
              <Button
                rightIcon={
                  inputValues.recepientAddressType === 'ethereum' ? (
                    <MetaMaskIcon size="lg" />
                  ) : (
                    <WalletLineIcon size="lg" />
                  )
                }
                onClick={handleAddTokenToMetamask}
                isFullWidth
                variant="secondary"
                isDisabled={inputValues.recepientAddressType === 'substrate'}
              >
                Add token to{' '}
                {inputValues.recepientAddressType === 'ethereum'
                  ? 'MetaMask'
                  : 'wallet'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleOpenChange(false)} isFullWidth>
                Close
              </Button>
              <Button
                {...sharedExternalLinkProps}
                isFullWidth
                variant="secondary"
                href={GITHUB_BUG_REPORT_URL}
              >
                Report Bug
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProcessingModal;

const MintTxLinkOrHash = (props: {
  mintTokenResult: MintTokenResult | null;
}) => {
  const { mintTokenResult } = props;

  const txLinkOrTxHash = useMemo(() => {
    if (!mintTokenResult) return '';

    if (FaucetError.isFaucetError(mintTokenResult)) return '';

    const { hash, typedChainId, isSubstrate } =
      parseMintResult(mintTokenResult);

    const chain = chainsConfig[typedChainId];

    if (!chain) {
      console.warn(
        `Typed chain id ${typedChainId} is not in the chains config`
      );
      return hash;
    }

    if (!chain.blockExplorers || !hash) {
      return hash;
    }

    try {
      return getExplorerURI(
        chain.blockExplorers.default.url,
        hash,
        'tx',
        isSubstrate ? 'polkadot' : 'web3'
      ).toString();
    } catch (error) {
      console.error(error);
      return hash;
    }
  }, [mintTokenResult]);

  if (!txLinkOrTxHash) return null;

  if (isValidUrl(txLinkOrTxHash)) {
    return (
      <Button
        {...sharedExternalLinkProps}
        href={txLinkOrTxHash}
        isDisabled={!txLinkOrTxHash}
        variant="link"
      >
        View on Explorer
      </Button>
    );
  }

  return (
    <KeyValueWithButton
      label="Transaction Hash"
      size="sm"
      className="mx-auto"
      keyValue={txLinkOrTxHash}
    />
  );
};

const usageUrl = populateDocsUrl(
  WEBB_DOC_ROUTES_RECORD['projects']['hubble-bridge']['usage-guide'].route
);

const getSuccessMessage = () => {
  return (
    <>
      This transfer has been made to your wallet address. Experience private
      bridging on Hubble or explore token usages on the{' '}
      <a
        className="!text-inherit hover:underline"
        {...sharedExternalLinkProps}
        href={usageUrl}
      >
        doc site
      </a>
      !
    </>
  );
};

const parseMintResult = (
  result: MintTokenBody
): {
  isSubstrate: boolean;
  hash: string;
  typedChainId: number;
} => {
  const { typed_chain_id, tx_result } = result;

  if ('Substrate' in tx_result) {
    return {
      hash: tx_result.Substrate.block_hash,
      isSubstrate: true,
      typedChainId: calculateTypedChainId(
        ChainType.Substrate,
        typed_chain_id.id
      ),
    };
  }

  return {
    hash: tx_result.Evm.transactionHash,
    isSubstrate: false,
    typedChainId: calculateTypedChainId(ChainType.EVM, typed_chain_id.id),
  };
};
