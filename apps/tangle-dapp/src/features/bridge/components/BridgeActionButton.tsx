import { BN } from '@polkadot/util/bn/bn';
import { Account } from '@tangle-network/abstract-api-provider/account';
import { Chain, ChainConfig, WalletConfig } from '@tangle-network/dapp-config';
import { EVMTokenBridgeEnum } from '@tangle-network/evm-contract-metadata';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { useCallback, useMemo } from 'react';

interface BridgeActionButtonProps {
  activeWallet: WalletConfig | undefined;
  activeChain: Chain | null | undefined;
  selectedSourceChain: ChainConfig;
  selectedDestinationChain: ChainConfig;
  activeAccount: Account<unknown> | null;
  selectedToken: BridgeToken | null;
  amount: BN | null;
  destinationAddress: string | null;
  isAmountInputError: boolean;
  isAddressInputError: boolean;
  isTxInProgress: boolean;
  isHyperlaneQuoteLoading: boolean;
  hyperlaneQuoteError: any | null;
  isHyperlaneQuote: boolean;
  hyperlaneQuote: any | null;
  openConfirmBridgeModal: () => void;
  refetchHyperlaneQuote: () => void;
}

export default function BridgeActionButton({
  activeWallet,
  activeChain,
  selectedSourceChain,
  activeAccount,
  selectedToken,
  amount,
  destinationAddress,
  isAmountInputError,
  isAddressInputError,
  isTxInProgress,
  isHyperlaneQuoteLoading,
  hyperlaneQuoteError,
  isHyperlaneQuote,
  openConfirmBridgeModal,
  refetchHyperlaneQuote,
}: BridgeActionButtonProps) {
  const isWrongChain = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return isEvmWallet && activeChain?.id !== selectedSourceChain.id;
  }, [activeChain?.id, activeWallet?.platform, selectedSourceChain.id]);

  let isActionBtnDisabled = false;

  if (
    !activeAccount ||
    !activeChain ||
    !activeWallet ||
    !selectedToken ||
    isWrongChain ||
    !amount ||
    !destinationAddress ||
    isAmountInputError ||
    isAddressInputError
  ) {
    isActionBtnDisabled = true;
  }

  const isActionBtnLoading = useMemo(() => {
    return isHyperlaneQuoteLoading || isTxInProgress;
  }, [isHyperlaneQuoteLoading, isTxInProgress]);

  const actionBtnLoadingText = useMemo(() => {
    if (isTxInProgress) {
      return 'Transaction in Progress';
    }

    return isActionBtnLoading ? 'Preview Transaction' : '';
  }, [isTxInProgress, isActionBtnLoading]);

  const actionButtonText = useMemo(() => {
    if (isTxInProgress) {
      return 'Transaction in Progress';
    } else if (
      amount &&
      destinationAddress &&
      !isAmountInputError &&
      !isAddressInputError &&
      isHyperlaneQuote &&
      !hyperlaneQuoteError
    ) {
      return 'Confirm Bridge';
    }

    return 'Preview Transaction';
  }, [
    isTxInProgress,
    amount,
    destinationAddress,
    isAmountInputError,
    isAddressInputError,
    isHyperlaneQuote,
    hyperlaneQuoteError,
  ]);

  const onClickActionBtn = useCallback(() => {
    if (
      amount &&
      destinationAddress &&
      selectedToken &&
      !isAmountInputError &&
      !isAddressInputError &&
      isHyperlaneQuote &&
      !hyperlaneQuoteError
    ) {
      openConfirmBridgeModal();
    } else if (amount && selectedToken && !isAmountInputError) {
      if (selectedToken.bridgeType === EVMTokenBridgeEnum.Hyperlane) {
        refetchHyperlaneQuote();
      }
    }
  }, [
    amount,
    destinationAddress,
    selectedToken,
    isAmountInputError,
    isAddressInputError,
    isHyperlaneQuote,
    hyperlaneQuoteError,
    openConfirmBridgeModal,
    refetchHyperlaneQuote,
  ]);

  return (
    <Button
      variant="primary"
      isFullWidth
      onClick={onClickActionBtn}
      isLoading={isActionBtnLoading}
      isDisabled={isActionBtnDisabled}
      loadingText={actionBtnLoadingText}
    >
      {actionButtonText}
    </Button>
  );
}
