import { Currency } from '@webb-tools/abstract-api-provider/currency/currency';
import utxoFromVAnchorNote from '@webb-tools/abstract-api-provider/utils/utxoFromVAnchorNote';
import { useWebContext } from '@webb-tools/api-provider-environment';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { NoteManager } from '@webb-tools/note-manager/note-manager';
import {
  useBalancesFromNotes,
  useCurrencyBalance,
  useNoteAccount,
  useVAnchor,
} from '@webb-tools/react-hooks';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_PATH,
  DEST_CHAIN_KEY,
  HAS_REFUND_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  TOKEN_KEY,
  WITHDRAW_PATH,
} from '../../../../../constants';
import WithdrawConfirmContainer from '../../../../../containers/WithdrawConfirmContainer/WithdrawConfirmContainer';
import { useConnectWallet } from '../../../../../hooks/useConnectWallet';
import handleTxError from '../../../../../utils/handleTxError';
import validateNoteLeafIndex from '../../../../../utils/validateNoteLeafIndex';

export type UseWithdrawButtonPropsArgs = {
  balances: ReturnType<typeof useBalancesFromNotes>['balances'];
  receivingAmount?: number;
  refundAmount?: bigint;
  isFeeLoading?: boolean;
  totalFeeWei?: bigint;
  resetFeeInfo?: () => void;
};

function useWithdrawButtonProps({
  balances,
  isFeeLoading,
  receivingAmount,
  refundAmount,
  resetFeeInfo,
  totalFeeWei,
}: UseWithdrawButtonPropsArgs) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const {
    activeApi,
    activeChain,
    apiConfig,
    isConnecting,
    loading,
    switchChain,
    activeWallet,
    noteManager,
  } = useWebContext();

  const [amount, destTypedChainId, poolId, tokenId] = useMemo(() => {
    const amountStr = searchParams.get(AMOUNT_KEY) ?? '';
    const destTypedIdStr = searchParams.get(DEST_CHAIN_KEY) ?? '';
    const poolId = searchParams.get(POOL_KEY) ?? '';
    const tokenId = searchParams.get(TOKEN_KEY) ?? '';

    return [
      amountStr ? formatEther(BigInt(amountStr)) : undefined,
      !Number.isNaN(parseInt(destTypedIdStr))
        ? parseInt(destTypedIdStr)
        : undefined,
      !Number.isNaN(parseInt(poolId)) ? parseInt(poolId) : undefined,
      !Number.isNaN(parseInt(tokenId)) ? parseInt(tokenId) : undefined,
    ];
  }, [searchParams]);

  const [recipient, hasRefund] = useMemo(() => {
    const recipientStr = searchParams.get(RECIPIENT_KEY) ?? '';
    const hasRefundStr = searchParams.get(HAS_REFUND_KEY) ?? '';

    return [recipientStr ? recipientStr : undefined, !!hasRefundStr];
  }, [searchParams]);

  const [fungibleCfg, wrappableCfg, destChainCfg] = useMemo(() => {
    return [
      typeof poolId === 'number' ? apiConfig.currencies[poolId] : undefined,
      typeof tokenId === 'number' ? apiConfig.currencies[tokenId] : undefined,
      typeof destTypedChainId === 'number' ? apiConfig.chains[destTypedChainId] : undefined
    ];
  }, [apiConfig.chains, apiConfig.currencies, destTypedChainId, poolId, tokenId]); // prettier-ignore

  const fungibleAddress = useMemo(() => {
    if (typeof destTypedChainId !== 'number' || !fungibleCfg) {
      return undefined;
    }

    return fungibleCfg.addresses.get(destTypedChainId);
  }, [destTypedChainId, fungibleCfg]);

  const liquidityPool = useCurrencyBalance(
    wrappableCfg && wrappableCfg.role !== CurrencyRole.Governable
      ? wrappableCfg.id
      : undefined,
    fungibleAddress,
    destTypedChainId
  );

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const { isWalletConnected, toggleModal } = useConnectWallet();

  const isSucficientLiq = useMemo(() => {
    if (!wrappableCfg) {
      // No wrappable selected, no need to check
      return true;
    }

    // Wrappable is the same as fungible, no unwrap
    if (wrappableCfg.id === fungibleCfg?.id) {
      return true;
    }

    // No amount, no need to check
    if (!amount) {
      return true;
    }

    const amountFloat = Number(amount);

    if (typeof liquidityPool !== 'number' && amountFloat > 0) {
      return true;
    }

    if (!liquidityPool) {
      return false;
    }

    return liquidityPool >= amountFloat;
  }, [amount, fungibleCfg?.id, liquidityPool, wrappableCfg]);

  const isValidAmount = useMemo(() => {
    if (!fungibleCfg) {
      return false;
    }

    if (typeof destTypedChainId !== 'number') {
      return false;
    }

    if (!amount) {
      return false;
    }

    const amountFloat = parseFloat(amount);
    const balance = balances[fungibleCfg.id]?.[destTypedChainId];
    if (typeof balance !== 'bigint' && amountFloat > 0) {
      return true;
    }

    if (!balance || amountFloat <= 0) {
      return false;
    }

    if (typeof receivingAmount !== 'number') {
      return false;
    }

    return parseEther(amount) <= balance && receivingAmount >= 0;
  }, [amount, balances, destTypedChainId, fungibleCfg, receivingAmount]);

  const connCnt = useMemo(() => {
    if (!activeApi) {
      return 'Connect Wallet';
    }

    if (!hasNoteAccount) {
      return 'Create Note Account';
    }

    const activeId = activeApi.typedChainidSubject.getValue();
    if (activeId !== destTypedChainId) {
      return 'Switch Chain';
    }

    return undefined;
  }, [activeApi, destTypedChainId, hasNoteAccount]);

  const inputCnt = useMemo(
    () => {
      if (!destTypedChainId) {
        return 'Select chain';
      }

      if (!fungibleCfg) {
        return 'Select pool';
      }

      if (!amount) {
        return 'Enter amount';
      }

      if (!wrappableCfg) {
        return 'Select withdraw token';
      }

      if (!recipient) {
        return 'Enter recipient';
      }

      if (!isSucficientLiq) {
        return 'Insufficient liquidity';
      }

      if (!isValidAmount) {
        return 'Insufficient balance';
      }
    },
    // prettier-ignore
    [amount, destTypedChainId, fungibleCfg, isSucficientLiq, isValidAmount, recipient, wrappableCfg]
  );

  const btnText = useMemo(() => {
    if (inputCnt) {
      return inputCnt;
    }

    if (connCnt) {
      return connCnt;
    }

    if (fungibleCfg && fungibleCfg.id !== wrappableCfg?.id) {
      return 'Withdraw and Unwrap';
    }

    return 'Withdraw';
  }, [connCnt, fungibleCfg, inputCnt, wrappableCfg?.id]);

  const isDisabled = useMemo(
    () => {
      const allInputsFilled =
        !!amount && !!fungibleCfg && !!wrappableCfg && !!recipient;

      const userInputValid =
        allInputsFilled && isSucficientLiq && isValidAmount;

      if (!userInputValid || isFeeLoading) {
        return true;
      }

      if (!isWalletConnected || !hasNoteAccount) {
        return false;
      }

      const isDestChainActive =
        destChainCfg &&
        destChainCfg.id === activeChain?.id &&
        destChainCfg.chainType === activeChain?.chainType;
      if (!activeChain || !isDestChainActive) {
        return false;
      }

      return false;
    },
    // prettier-ignore
    [activeChain, amount, destChainCfg, fungibleCfg, hasNoteAccount, isFeeLoading, isSucficientLiq, isValidAmount, isWalletConnected, recipient, wrappableCfg]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const { api: vAnchorApi } = useVAnchor();

  const [withdrawConfirmComponent, setWithdrawConfirmComponent] =
    useState<React.ReactElement<
      ComponentProps<typeof WithdrawConfirmContainer>,
      typeof WithdrawConfirmContainer
    > | null>(null);

  const handleSwitchChain = useCallback(
    async () => {
      if (typeof destTypedChainId !== 'number') {
        return;
      }

      const nextChain = chainsPopulated[destTypedChainId];
      if (!nextChain) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }

      const isNextChainActive =
        activeChain?.id === nextChain.id &&
        activeChain?.chainType === nextChain.chainType;

      if (!isWalletConnected || !isNextChainActive) {
        if (activeWallet && nextChain.wallets.includes(activeWallet.id)) {
          await switchChain(nextChain, activeWallet);
        } else {
          toggleModal(true, nextChain);
        }
        return;
      }

      if (!hasNoteAccount) {
        setOpenNoteAccountModal(true);
      }
    },
    // prettier-ignore
    [activeChain?.chainType, activeChain?.id, activeWallet, destTypedChainId, hasNoteAccount, isWalletConnected, setOpenNoteAccountModal, switchChain, toggleModal]
  );

  const handleWithdrawBtnClick = useCallback(
    async () => {
      try {
        if (connCnt) {
          return await handleSwitchChain();
        }

        // For type assertion
        const _validAmount =
          isValidAmount && !!amount && typeof receivingAmount === 'number';

        const allInputsFilled =
          !!destChainCfg &&
          !!fungibleCfg &&
          !!destTypedChainId &&
          !!recipient &&
          _validAmount;

        const doesApiReady =
          !!activeApi?.state.activeBridge && !!vAnchorApi && !!noteManager;

        if (!allInputsFilled || !doesApiReady) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (activeApi.state.activeBridge?.currency.id !== fungibleCfg.id) {
          throw WebbError.from(WebbErrorCodes.InvalidArguments);
        }

        const anchorId = activeApi.state.activeBridge.targets[destTypedChainId];
        if (!anchorId) {
          throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
        }

        const resourceId = await vAnchorApi.getResourceId(
          anchorId,
          destChainCfg.id,
          destChainCfg.chainType
        );

        const avaiNotes = (
          noteManager.getNotesOfChain(resourceId.toString()) ?? []
        ).filter(
          (note) =>
            note.note.tokenSymbol === fungibleCfg.symbol &&
            !!fungibleCfg.addresses.get(parseInt(note.note.targetChainId))
        );

        const fungibleDecimals = fungibleCfg.decimals;
        const amountFloat = parseFloat(amount);
        const amountBig = parseUnits(amount, fungibleDecimals);

        // Get the notes that will be spent for this withdraw
        const inputNotes = NoteManager.getNotesFifo(avaiNotes, amountBig);
        if (!inputNotes) {
          throw WebbError.from(WebbErrorCodes.NoteParsingFailure);
        }

        // Validate the input notes
        const edges = await vAnchorApi.getLatestNeighborEdges(
          fungibleCfg.id,
          destTypedChainId
        );
        const nextIdx = await vAnchorApi.getNextIndex(
          destTypedChainId,
          fungibleCfg.id
        );

        const valid = inputNotes.every((note) => {
          if (note.note.targetChainId === destTypedChainId.toString()) {
            return note.note.index ? BigInt(note.note.index) < nextIdx : true;
          } else {
            return validateNoteLeafIndex(note, edges);
          }
        });
        if (!valid) {
          throw WebbError.from(WebbErrorCodes.NotesNotReady);
        }

        // Sum up the amount of the input notes to calculate the change amount
        const totalAmountInput = inputNotes.reduce(
          (acc, note) => acc + BigInt(note.note.amount),
          ZERO_BIG_INT
        );

        const changeAmount = totalAmountInput - amountBig;
        if (changeAmount < 0) {
          throw WebbError.from(WebbErrorCodes.InvalidArguments);
        }

        const keypair = noteManager.getKeypair();
        if (!keypair.privkey) {
          throw WebbError.from(WebbErrorCodes.KeyPairNotFound);
        }

        const changeNote =
          changeAmount > 0
            ? await noteManager.generateNote(
                activeApi.backend,
                destTypedChainId,
                anchorId,
                destTypedChainId,
                anchorId,
                fungibleCfg.symbol,
                fungibleDecimals,
                changeAmount
              )
            : undefined;

        // Generate change utxo (or dummy utxo if the changeAmount is `0`)
        const changeUtxo = changeNote
          ? await utxoFromVAnchorNote(
              changeNote.note,
              changeNote.note.index ? parseInt(changeNote.note.index) : 0
            )
          : await activeApi.generateUtxo({
              curve: noteManager.defaultNoteGenInput.curve,
              backend: activeApi.backend,
              amount: changeAmount.toString(),
              chainId: `${destTypedChainId}`,
              keypair,
              originChainId: `${destTypedChainId}`,
              index: activeApi.state.defaultUtxoIndex.toString(),
            });

        setWithdrawConfirmComponent(
          <WithdrawConfirmContainer
            changeUtxo={changeUtxo}
            changeNote={changeNote}
            changeAmount={parseFloat(
              formatUnits(changeAmount, fungibleDecimals)
            )}
            sourceTypedChainId={destTypedChainId}
            targetTypedChainId={destTypedChainId}
            availableNotes={inputNotes}
            amount={amountFloat}
            fee={typeof totalFeeWei === 'bigint' ? totalFeeWei : ZERO_BIG_INT}
            amountAfterFee={parseEther(`${receivingAmount}`)}
            isRefund={hasRefund}
            fungibleCurrency={{
              value: new Currency(fungibleCfg),
            }}
            unwrapCurrency={
              wrappableCfg && wrappableCfg.id !== fungibleCfg.id
                ? { value: new Currency(wrappableCfg) }
                : undefined
            }
            refundAmount={hasRefund ? refundAmount : undefined}
            refundToken={destChainCfg.nativeCurrency.symbol}
            recipient={recipient}
            onResetState={() => {
              resetFeeInfo?.();
              setWithdrawConfirmComponent(null);
              navigate(`/${BRIDGE_PATH}/${WITHDRAW_PATH}`);
            }}
            onClose={() => {
              setWithdrawConfirmComponent(null);
            }}
          />
        );
      } catch (error) {
        handleTxError(error, 'Withdraw');
      }
    },
    // prettier-ignore
    [activeApi, amount, connCnt, destChainCfg, destTypedChainId, fungibleCfg, handleSwitchChain, hasRefund, isValidAmount, navigate, noteManager, receivingAmount, recipient, refundAmount, resetFeeInfo, totalFeeWei, vAnchorApi, wrappableCfg]
  );

  return {
    isLoading,
    isDisabled,
    children: btnText,
    withdrawConfirmComponent,
    onClick: handleWithdrawBtnClick,
  };
}

export default useWithdrawButtonProps;
