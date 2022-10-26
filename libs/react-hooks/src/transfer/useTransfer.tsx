import {
  Currency,
  NewNotesTxResult,
  OptionalActiveRelayer,
  TransactionState,
  VAnchorTransfer,
  VanchorTransferPayload,
  WebbRelayer,
} from '@nepoche/abstract-api-provider';
import { InteractiveFeedback, WebbErrorCodes } from '@nepoche/dapp-types';
import { NoteManager } from '@nepoche/note-manager';
import { misbehavingRelayer, useWebContext } from '@nepoche/api-provider-environment';
import { calculateTypedChainId, ChainType, Note, parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { RelayersState, WithdrawErrors } from '../withdraw/useWithdraw';

export interface VAnchorTransferApi {
  receipt: string;
  outputNotes: Note[];
  setOutputNotes(notes: Note[]): void;
  transfer(): Promise<void>;
  cancel(): Promise<void>;
  stage: TransactionState;
  setStage(stage: TransactionState): void;
  setGovernedCurrency(currency: Currency): void;
  error: string;
  transferApi: VAnchorTransfer<any> | null;
  relayersState: RelayersState;
  setRelayer(relayer: WebbRelayer | null): void;
}

export type UseTransferProps = {
  notes: Note[];
  destination: number | undefined;
  recipient: string;
  amount: number;
};

export const useTransfer = (props: UseTransferProps): VAnchorTransferApi => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);
  const [receipt, setReceipt] = useState<string>('');
  const [outputNotes, setOutputNotes] = useState<Note[]>([]);
  const [relayersState, setRelayersState] = useState<RelayersState>({
    relayers: [],
    activeRelayer: null,
    loading: true,
  });
  const { activeApi } = useWebContext();
  const [error, setError] = useState<WithdrawErrors>({
    error: '',
    validationError: {
      notes: [],
      recipient: '',
    },
  });

  /// api
  const transferApi = useMemo(() => {
    const transferApi = activeApi?.methods.variableAnchor.transfer;
    if (!transferApi?.enabled) {
      return null;
    }
    return transferApi.inner;
  }, [activeApi]);

  // hook events
  useEffect(() => {
    if (!transferApi) {
      return;
    }

    transferApi.on('stateChange', (state) => {
      setStage(state);
    });

    return () => {
      transferApi.unsubscribeAll();
    };
  }, [transferApi]);

  const transfer = useCallback(async () => {
    if (!transferApi) {
      throw new Error('Api not ready');
    }

    if (stage === TransactionState.Ideal) {
      if (props.notes.length && props.destination) {
        try {
          const spendableNotes = NoteManager.getNotesFifo(
            props.notes,
            ethers.utils.parseUnits(props.amount.toString(), props.notes[0].note.denomination)
          );

          // If the available notes are not sufficient for requested withdraw, return.
          // This case shouldn't be hit because the frontend should not make a withdraw
          // call if the form inputs are not sufficient.
          if (!spendableNotes) {
            console.log('no spendableNotes detected');
            return;
          }
          const noteStrings = spendableNotes.map((note) => note.serialize());

          const txResult = await transferApi.transfer({
            inputNotes: noteStrings,
            amount: ethers.utils.parseUnits(props.amount.toString(), props.notes[0].note.denomination).toString(),
            targetTypedChainId: props.destination,
            recipient: props.recipient,
          });
          setReceipt(txResult.txHash);
          setOutputNotes(txResult.outputNotes);
        } catch (e) {
          console.log('error from transfer api', e);

          if ((e as any)?.code === WebbErrorCodes.RelayerMisbehaving) {
            let interactiveFeedback: InteractiveFeedback = misbehavingRelayer();
            registerInteractiveFeedback(interactiveFeedback);
          }
        }
      }
    }
  }, [props.amount, props.destination, props.notes, props.recipient, stage, transferApi]);

  const setGovernedCurrency = useCallback(
    (currency: Currency): void => {
      if (!activeApi) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  const cancel = useCallback(() => {
    if (!transferApi) {
      throw new Error('Api not ready');
    }
    return transferApi.cancel().catch(console.error);
  }, [transferApi]);

  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      if (props.destination) {
        activeApi?.relayerManager.setActiveRelayer(nextRelayer, props.destination);
      }
    },
    [activeApi?.relayerManager, props.destination]
  );

  // hook events
  useEffect(() => {
    if (!activeApi) {
      return;
    }

    // We can determine the compatible relayers by the selected target.
    if (props.destination) {
      const typedChainId = parseTypedChainId(props.destination);
      const base = typedChainId.chainType === ChainType.EVM ? 'evm' : 'substrate';

      const relayers = activeApi.relayerManager.getRelayers({
        baseOn: base,
        typedChainId: props.destination,
        chainId: typedChainId.chainId,
        contract: 'VAnchor',
      });

      setRelayersState((p) => ({
        ...p,
        loading: false,
        relayers: relayers,
      }));
    }

    // Subscribe to updates for the active relayer
    const sub = activeApi.relayerManager.activeRelayerWatcher.subscribe((next: OptionalActiveRelayer) => {
      setRelayersState((p) => ({
        ...p,
        activeRelayer: next,
      }));
    });

    if (!transferApi) {
      return;
    }

    const unsubscribe: Record<string, (() => void) | void> = {};
    unsubscribe['stateChange'] = transferApi.on('stateChange', (stage: TransactionState) => {
      setStage(stage);
    });

    unsubscribe['error'] = transferApi.on('error', (transferError: any) => {
      setError((p) => ({
        ...p,
        error: transferError,
      }));
    });

    return () => {
      sub?.unsubscribe();
      Object.values(unsubscribe).forEach((v) => v && v());
    };
  }, [transferApi, activeApi, activeApi?.relayerManager, props.destination]);

  return {
    receipt,
    setOutputNotes,
    outputNotes,
    relayersState,
    setRelayer,
    stage,
    setStage,
    setGovernedCurrency,
    transferApi,
    transfer,
    error: error.error,
    cancel,
  };
};
function registerInteractiveFeedback(interactiveFeedback: InteractiveFeedback) {
  throw new Error('Function not implemented.');
}
