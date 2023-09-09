import { Currency } from '@webb-tools/abstract-api-provider/currency';
import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import utxoFromVAnchorNote from '@webb-tools/abstract-api-provider/utils/utxoFromVAnchorNote';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { NoteManager } from '@webb-tools/note-manager/';
import { useBalancesFromNotes } from '@webb-tools/react-hooks/currency/useBalancesFromNotes';
import { useNoteAccount } from '@webb-tools/react-hooks/useNoteAccount';
import { useVAnchor } from '@webb-tools/react-hooks/vanchor/useVAnchor';
import { Keypair } from '@webb-tools/sdk-core';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther, parseUnits } from 'viem';
import {
  AMOUNT_KEY,
  BRIDGE_PATH,
  DEST_CHAIN_KEY,
  HAS_REFUND_KEY,
  POOL_KEY,
  RECIPIENT_KEY,
  REFUND_RECIPIENT_KEY,
  SOURCE_CHAIN_KEY,
  TRANSFER_PATH,
} from '../../../../../constants';
import TransferConfirmContainer from '../../../../../containers/TransferConfirmContainer/TransferConfirmContainer';
import { useConnectWallet } from '../../../../../hooks/useConnectWallet';
import handleTxError from '../../../../../utils/handleTxError';
import validateNoteLeafIndex from '../../../../../utils/validateNoteLeafIndex';

export type UseTransferButtonPropsArgs = {
  balances: ReturnType<typeof useBalancesFromNotes>['balances'];
  receivingAmount?: number;
  isFeeLoading?: boolean;
  totalFeeWei?: bigint;
  feeToken?: string;
  resetFeeInfo?: () => void;
  activeRelayer: OptionalActiveRelayer;
  refundAmount?: bigint;
  refundToken?: string;
  refundRecipientError?: string;
};

function useTransferButtonProps({
  balances,
  receivingAmount,
  isFeeLoading,
  totalFeeWei,
  feeToken,
  refundAmount,
  refundToken,
  resetFeeInfo,
  activeRelayer,
  refundRecipientError,
}: UseTransferButtonPropsArgs) {
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

  const [amount, poolId, recipient] = useMemo(() => {
    const amountStr = searchParams.get(AMOUNT_KEY) ?? '';

    const poolId = searchParams.get(POOL_KEY) ?? '';

    const recipientStr = searchParams.get(RECIPIENT_KEY) ?? '';

    return [
      amountStr ? formatEther(BigInt(amountStr)) : undefined,
      !Number.isNaN(parseInt(poolId)) ? parseInt(poolId) : undefined,
      recipientStr ? recipientStr : undefined,
    ];
  }, [searchParams]);

  const [hasRefund, refundRecipient] = useMemo(() => {
    const hasRefund = searchParams.has(HAS_REFUND_KEY);
    const refundRecipientStr = searchParams.get(REFUND_RECIPIENT_KEY) ?? '';

    return [!!hasRefund, refundRecipientStr ? refundRecipientStr : undefined];
  }, [searchParams]);

  const [srcTypedChainId, destTypedChainId] = useMemo(() => {
    const srcTypedChainId = searchParams.get(SOURCE_CHAIN_KEY) ?? '';
    const destTypedIdStr = searchParams.get(DEST_CHAIN_KEY) ?? '';

    return [
      !Number.isNaN(parseInt(srcTypedChainId))
        ? parseInt(srcTypedChainId)
        : undefined,
      !Number.isNaN(parseInt(destTypedIdStr))
        ? parseInt(destTypedIdStr)
        : undefined,
    ];
  }, [searchParams]);

  const [fungibleCfg, srcChain, destChain] = useMemo(
    () => {
      return [
        typeof poolId === 'number' ? apiConfig.currencies[poolId] : undefined,
        typeof srcTypedChainId === 'number'
          ? chainsPopulated[srcTypedChainId]
          : undefined,
        typeof destTypedChainId === 'number'
          ? chainsPopulated[destTypedChainId]
          : undefined,
      ];
    },
    // prettier-ignore
    [apiConfig.currencies, destTypedChainId, poolId, srcTypedChainId]
  );

  const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

  const { isWalletConnected, toggleModal } = useConnectWallet();

  const isValidAmount = useMemo(() => {
    if (!fungibleCfg) {
      return false;
    }

    if (typeof srcTypedChainId !== 'number') {
      return false;
    }

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return false;
    }

    const balance = balances[fungibleCfg.id]?.[srcTypedChainId];
    if (typeof balance !== 'bigint') {
      return true;
    }

    if (typeof receivingAmount !== 'number') {
      return false;
    }

    return parseEther(amount) <= balance && receivingAmount >= 0;
  }, [amount, balances, srcTypedChainId, fungibleCfg, receivingAmount]);

  const connCnt = useMemo(() => {
    if (!activeApi) {
      return 'Connect Wallet';
    }

    if (!hasNoteAccount) {
      return 'Create Note Account';
    }

    const activeId = activeApi.typedChainidSubject.getValue();
    if (activeId !== srcTypedChainId) {
      return 'Switch Chain';
    }

    return undefined;
  }, [activeApi, srcTypedChainId, hasNoteAccount]);

  const inputCnt = useMemo(
    () => {
      if (!srcTypedChainId || !destTypedChainId) {
        return 'Select chain';
      }

      if (!fungibleCfg) {
        return 'Select pool';
      }

      if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
        return 'Enter amount';
      }

      if (!recipient) {
        return 'Enter recipient';
      }

      if (hasRefund && !refundRecipient) {
        return 'Enter refund recipient';
      }

      if (!isValidAmount) {
        return 'Insufficient balance';
      }
    },
    // prettier-ignore
    [srcTypedChainId, destTypedChainId, fungibleCfg, amount, recipient, hasRefund, refundRecipient, isValidAmount]
  );

  const btnText = useMemo(() => {
    if (inputCnt) {
      return inputCnt;
    }

    if (connCnt) {
      return connCnt;
    }

    return 'Transfer';
  }, [connCnt, inputCnt]);

  const isDisabled = useMemo(
    () => {
      const allInputsFilled =
        !!amount &&
        !!fungibleCfg &&
        !!recipient &&
        typeof destTypedChainId === 'number';

      const refundFilled = hasRefund ? !!refundRecipient : true;

      const userInputValid =
        allInputsFilled &&
        refundFilled &&
        isValidAmount &&
        !refundRecipientError;

      if (!userInputValid || isFeeLoading) {
        return true;
      }

      if (!isWalletConnected || !hasNoteAccount) {
        return false;
      }

      const isSrcChainActive =
        srcChain &&
        srcChain.id === activeChain?.id &&
        srcChain.chainType === activeChain?.chainType;

      if (!activeChain || !isSrcChainActive) {
        return false;
      }

      return false;
    },
    // prettier-ignore
    [activeChain, amount, destTypedChainId, fungibleCfg, hasNoteAccount, hasRefund, isFeeLoading, isValidAmount, isWalletConnected, recipient, refundRecipient, refundRecipientError, srcChain]
  );

  const isLoading = useMemo(() => {
    return loading || isConnecting;
  }, [isConnecting, loading]);

  const { api: vAnchorApi } = useVAnchor();

  const [transferConfirmComponent, setTransferConfirmComponent] =
    useState<React.ReactElement<
      ComponentProps<typeof TransferConfirmContainer>,
      typeof TransferConfirmContainer
    > | null>(null);

  const handleSwitchChain = useCallback(
    async () => {
      if (typeof srcTypedChainId !== 'number') {
        return;
      }

      const nextChain = chainsPopulated[srcTypedChainId];
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
    [activeChain?.chainType, activeChain?.id, activeWallet, hasNoteAccount, isWalletConnected, setOpenNoteAccountModal, srcTypedChainId, switchChain, toggleModal]
  );

  const handleTransferBtnClick = useCallback(
    async () => {
      try {
        if (connCnt) {
          return await handleSwitchChain();
        }

        // For type assertion
        const _validAmount =
          isValidAmount && !!amount && typeof receivingAmount === 'number';

        const allInputsFilled =
          !!srcChain &&
          !!fungibleCfg &&
          !!srcTypedChainId &&
          !!destTypedChainId &&
          !!recipient &&
          (hasRefund ? !!refundRecipient : true) &&
          _validAmount;

        const doesApiReady =
          !!activeApi?.state.activeBridge && !!vAnchorApi && !!noteManager;

        if (!allInputsFilled || !doesApiReady || !destChain) {
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
          srcChain.id,
          srcChain.chainType
        );

        const avaiNotes = (
          noteManager.getNotesOfChain(resourceId.toString()) ?? []
        ).filter(
          (note) =>
            note.note.tokenSymbol === fungibleCfg.symbol &&
            !!fungibleCfg.addresses.get(parseInt(note.note.targetChainId))
        );

        const fungibleDecimals = fungibleCfg.decimals;
        const amountBig = parseUnits(amount, fungibleDecimals);

        // Get the notes that will be spent for this withdraw
        const inputNotes = NoteManager.getNotesFifo(avaiNotes, amountBig);
        if (!inputNotes) {
          throw WebbError.from(WebbErrorCodes.NoteParsingFailure);
        }

        // Validate the input notes
        const edges = await vAnchorApi.getLatestNeighborEdges(
          fungibleCfg.id,
          srcTypedChainId
        );
        const nextIdx = await vAnchorApi.getNextIndex(
          srcTypedChainId,
          fungibleCfg.id
        );

        const valid = inputNotes.every((note) => {
          if (note.note.sourceChainId === srcTypedChainId.toString()) {
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

        // Setup the recipient's keypair.
        const recipientKeypair = Keypair.fromString(recipient);

        const utxoAmount =
          activeRelayer && typeof totalFeeWei == 'bigint'
            ? amountBig - totalFeeWei
            : amountBig;

        const transferUtxo = await activeApi.generateUtxo({
          curve: noteManager.defaultNoteGenInput.curve,
          backend: activeApi.backend,
          amount: utxoAmount.toString(),
          chainId: destTypedChainId.toString(),
          keypair: recipientKeypair,
          originChainId: srcTypedChainId.toString(),
          index: activeApi.state.defaultUtxoIndex.toString(),
        });

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

        setTransferConfirmComponent(
          <TransferConfirmContainer
            inputNotes={inputNotes}
            amount={receivingAmount}
            feeInWei={
              typeof totalFeeWei === 'bigint' ? totalFeeWei : ZERO_BIG_INT
            }
            feeToken={feeToken}
            changeAmount={Number(formatEther(changeAmount))}
            currency={new Currency(fungibleCfg)}
            destChain={destChain}
            recipient={recipient}
            relayer={activeRelayer}
            note={changeNote}
            changeUtxo={changeUtxo}
            transferUtxo={transferUtxo}
            onResetState={() => {
              resetFeeInfo?.();
              setTransferConfirmComponent(null);
              navigate(`/${BRIDGE_PATH}/${TRANSFER_PATH}`);
            }}
            onClose={() => {
              setTransferConfirmComponent(null);
            }}
            refundAmount={refundAmount}
            refundToken={refundToken}
            refundRecipient={refundRecipient}
          />
        );
      } catch (error) {
        handleTxError(error, 'Transfer');
      }
    },
    // prettier-ignore
    [activeApi, activeRelayer, amount, connCnt, destChain, destTypedChainId, feeToken, fungibleCfg, handleSwitchChain, hasRefund, isValidAmount, navigate, noteManager, receivingAmount, recipient, refundAmount, refundRecipient, refundToken, resetFeeInfo, srcChain, srcTypedChainId, totalFeeWei, vAnchorApi]
  );

  return {
    isLoading,
    isDisabled,
    children: btnText,
    transferConfirmComponent,
    onClick: handleTransferBtnClick,
  };
}

export default useTransferButtonProps;
