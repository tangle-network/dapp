import { Currency } from '@webb-tools/abstract-api-provider/currency/currency';
import utxoFromVAnchorNote from '@webb-tools/abstract-api-provider/utils/utxoFromVAnchorNote';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { NoteManager } from '@webb-tools/note-manager/note-manager';
import {
  useBalancesFromNotes,
  useCurrencyBalance,
  useVAnchor,
} from '@webb-tools/react-hooks';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_PATH,
  HAS_REFUND_KEY,
  RECIPIENT_KEY,
  WITHDRAW_PATH,
} from '../../../../../constants';
import WithdrawConfirmContainer from '../../../../../containers/WithdrawConfirmContainer/WithdrawConfirmContainer';
import useChainsFromRoute from '../../../../../hooks/useChainsFromRoute';
import useConnectButtonProps from '../../../../../hooks/useConnectButtonProps';
import useCurrenciesFromRoute from '../../../../../hooks/useCurrenciesFromRoute';
import handleTxError from '../../../../../utils/handleTxError';

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

  const { activeApi, activeChain, isConnecting, loading, noteManager } =
    useWebContext();

  const [query] = useQueryParams({
    [AMOUNT_KEY]: StringParam,
    [RECIPIENT_KEY]: StringParam,
    [HAS_REFUND_KEY]: BooleanParam,
  });

  const {
    [AMOUNT_KEY]: amountStr,
    [RECIPIENT_KEY]: recipient,
    [HAS_REFUND_KEY]: hasRefund,
  } = query;

  const amount = useMemo(() => {
    if (typeof amountStr !== 'string' || amountStr.length === 0) {
      return;
    }

    try {
      return formatEther(BigInt(amountStr));
    } catch (error) {
      console.error(error);
    }
  }, [amountStr]);

  const { fungibleCfg, wrappableCfg } = useCurrenciesFromRoute();
  const { srcChainCfg, srcTypedChainId } = useChainsFromRoute();

  const { content: connectBtnCnt, handleConnect } =
    useConnectButtonProps(srcTypedChainId);

  const fungibleAddress = useMemo(() => {
    if (typeof srcTypedChainId !== 'number' || !fungibleCfg) {
      return undefined;
    }

    return fungibleCfg.addresses.get(srcTypedChainId);
  }, [fungibleCfg, srcTypedChainId]);

  const liquidityPool = useCurrencyBalance(
    wrappableCfg && wrappableCfg.role !== CurrencyRole.Governable
      ? wrappableCfg.id
      : undefined,
    fungibleAddress,
    srcTypedChainId ?? undefined
  );

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

    if (typeof srcTypedChainId !== 'number') {
      return false;
    }

    if (!amount) {
      return false;
    }

    const amountFloat = parseFloat(amount);
    const balance = balances[fungibleCfg.id]?.[srcTypedChainId];

    if (!balance || amountFloat <= 0) {
      return false;
    }

    if (typeof receivingAmount !== 'number') {
      return false;
    }

    return parseEther(amount) <= balance && receivingAmount >= 0;
  }, [amount, balances, srcTypedChainId, fungibleCfg, receivingAmount]);

  const inputCnt = useMemo(
    () => {
      if (typeof srcTypedChainId !== 'number') {
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
    [amount, srcTypedChainId, fungibleCfg, isSucficientLiq, isValidAmount, recipient, wrappableCfg]
  );

  const btnText = useMemo(() => {
    if (connectBtnCnt) {
      return connectBtnCnt;
    }

    if (inputCnt) {
      return inputCnt;
    }

    if (fungibleCfg && fungibleCfg.id !== wrappableCfg?.id) {
      return 'Withdraw and Unwrap';
    }

    return 'Withdraw';
  }, [connectBtnCnt, fungibleCfg, inputCnt, wrappableCfg?.id]);

  const isDisabled = useMemo(
    () => {
      if (connectBtnCnt) {
        return false;
      }

      const allInputsFilled =
        !!amount && !!fungibleCfg && !!wrappableCfg && !!recipient;

      const userInputValid =
        allInputsFilled && isSucficientLiq && isValidAmount;

      if (!userInputValid || isFeeLoading) {
        return true;
      }

      const isChainActive =
        srcChainCfg &&
        srcChainCfg.id === activeChain?.id &&
        srcChainCfg.chainType === activeChain?.chainType;
      if (!activeChain || !isChainActive) {
        return false;
      }

      return false;
    },
    // prettier-ignore
    [activeChain, amount, connectBtnCnt, fungibleCfg, isFeeLoading, isSucficientLiq, isValidAmount, recipient, srcChainCfg, wrappableCfg]
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

  const handleWithdrawBtnClick = useCallback(
    async () => {
      try {
        if (connectBtnCnt && typeof srcTypedChainId === 'number') {
          const connected = await handleConnect(srcTypedChainId);
          if (!connected) {
            return;
          }
        }

        // For type assertion
        const _validAmount =
          isValidAmount && !!amount && typeof receivingAmount === 'number';

        const allInputsFilled =
          !!srcChainCfg &&
          !!fungibleCfg &&
          !!srcTypedChainId &&
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

        const anchorId = activeApi.state.activeBridge.targets[srcTypedChainId];
        if (!anchorId) {
          throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
        }

        const resourceId = await vAnchorApi.getResourceId(
          anchorId,
          srcChainCfg.id,
          srcChainCfg.chainType
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
        const valid = await vAnchorApi.validateInputNotes(
          inputNotes,
          srcTypedChainId,
          fungibleCfg.id
        );

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
                srcTypedChainId,
                anchorId,
                srcTypedChainId,
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
              chainId: `${srcTypedChainId}`,
              keypair,
              originChainId: `${srcTypedChainId}`,
              index: activeApi.state.defaultUtxoIndex.toString(),
            });

        setWithdrawConfirmComponent(
          <WithdrawConfirmContainer
            changeUtxo={changeUtxo}
            changeNote={changeNote}
            changeAmount={parseFloat(
              formatUnits(changeAmount, fungibleDecimals)
            )}
            sourceTypedChainId={srcTypedChainId}
            targetTypedChainId={srcTypedChainId}
            availableNotes={inputNotes}
            amount={amountFloat}
            fee={typeof totalFeeWei === 'bigint' ? totalFeeWei : ZERO_BIG_INT}
            amountAfterFee={parseEther(`${receivingAmount}`)}
            isRefund={Boolean(hasRefund)}
            fungibleCurrency={{
              value: new Currency(fungibleCfg),
            }}
            unwrapCurrency={
              wrappableCfg && wrappableCfg.id !== fungibleCfg.id
                ? { value: new Currency(wrappableCfg) }
                : undefined
            }
            refundAmount={hasRefund ? refundAmount : undefined}
            refundToken={srcChainCfg.nativeCurrency.symbol}
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
    [activeApi, amount, connectBtnCnt, fungibleCfg, handleConnect, hasRefund, isValidAmount, navigate, noteManager, receivingAmount, recipient, refundAmount, resetFeeInfo, srcChainCfg, srcTypedChainId, totalFeeWei, vAnchorApi, wrappableCfg]
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
