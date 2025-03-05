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
  isRouterQuoteLoading: boolean;
  isHyperlaneQuoteLoading: boolean;
  routerQuoteError: any | null;
  hyperlaneQuoteError: any | null;
  isRouterQuote: boolean;
  isHyperlaneQuote: boolean;
  routerQuote: any | null;
  hyperlaneQuote: any | null;
  openConfirmBridgeModal: () => void;
  refetchRouterQuote: () => void;
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
  isRouterQuoteLoading,
  isHyperlaneQuoteLoading,
  routerQuoteError,
  hyperlaneQuoteError,
  isRouterQuote,
  isHyperlaneQuote,
  openConfirmBridgeModal,
  refetchRouterQuote,
  refetchHyperlaneQuote,
}: BridgeActionButtonProps) {
  const isWrongChain = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return isEvmWallet && activeChain?.id !== selectedSourceChain.id;
  }, [activeChain?.id, activeWallet?.platform, selectedSourceChain.id]);

  const isActionBtnDisabled = useMemo(() => {
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
      return true;
    }

    return false;
  }, [
    activeAccount,
    activeChain,
    activeWallet,
    selectedToken,
    isWrongChain,
    amount,
    destinationAddress,
    isAmountInputError,
    isAddressInputError,
  ]);

  const isActionBtnLoading = useMemo(() => {
    return isRouterQuoteLoading || isHyperlaneQuoteLoading || isTxInProgress;
  }, [isRouterQuoteLoading, isHyperlaneQuoteLoading, isTxInProgress]);

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
      (isRouterQuote || isHyperlaneQuote) &&
      !routerQuoteError &&
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
    isRouterQuote,
    isHyperlaneQuote,
    routerQuoteError,
    hyperlaneQuoteError,
  ]);

  const onClickActionBtn = useCallback(() => {
    if (
      amount &&
      destinationAddress &&
      selectedToken &&
      !isAmountInputError &&
      !isAddressInputError &&
      (isRouterQuote || isHyperlaneQuote) &&
      !routerQuoteError &&
      !hyperlaneQuoteError
    ) {
      openConfirmBridgeModal();
    } else if (amount && selectedToken && !isAmountInputError) {
      if (selectedToken.bridgeType === EVMTokenBridgeEnum.Hyperlane) {
        refetchHyperlaneQuote();
      } else {
        refetchRouterQuote();
      }
    }
  }, [
    amount,
    destinationAddress,
    selectedToken,
    isAmountInputError,
    isAddressInputError,
    isRouterQuote,
    isHyperlaneQuote,
    routerQuoteError,
    hyperlaneQuoteError,
    openConfirmBridgeModal,
    refetchHyperlaneQuote,
    refetchRouterQuote,
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
