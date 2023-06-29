import { VAnchorActions } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { Note, parseTypedChainId } from '@webb-tools/sdk-core';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useMemo, useState } from 'react';

export interface VAnchorAPI {
  addNoteToNoteManager(note: Note): Promise<void>;
  removeNoteFromNoteManager(note: Note): Promise<void>;
  cancel(): Promise<void>;
  error: string;
  api: VAnchorActions<any> | null;
  startNewTransaction(): void;
}

export const useVAnchor = (): VAnchorAPI => {
  const [error] = useState('');

  const {
    activeApi,
    txQueue: { api: txQueueApi },
    noteManager,
  } = useWebContext();

  const { notificationApi } = useWebbUI();

  /// api
  const api = useMemo(() => {
    const api = activeApi?.methods.variableAnchor.actions;
    if (!api?.enabled) {
      return null;
    }

    return api.inner;
  }, [activeApi]);

  const cancel = useCallback(() => {
    if (!api) {
      throw new Error('Api not ready');
    }
    return api.cancel().catch(console.error);
  }, [api]);

  const addNoteToNoteManager = useCallback(
    async (note: Note) => {
      if (!api || !noteManager) {
        notificationApi({
          variant: 'error',
          message: 'Note manager is not available',
          secondaryMessage:
            'Please connect to a wallet and create a note account',
        });
        return;
      }

      const { chainId, chainType } = parseTypedChainId(
        +note.note.targetChainId
      );
      const noteResourceId = await api.getResourceId(
        note.note.targetIdentifyingData,
        chainId,
        chainType
      );

      await noteManager.addNote(noteResourceId, note);
    },
    [api, noteManager, notificationApi]
  );

  const removeNoteFromNoteManager = useCallback(
    async (note: Note) => {
      if (!api || !noteManager) {
        notificationApi({
          variant: 'error',
          message: 'Note manager is not available',
          secondaryMessage:
            'Please connect to a wallet and create a note account',
        });
        return;
      }

      const { chainId, chainType } = parseTypedChainId(
        +note.note.targetChainId
      );
      const noteResourceId = await api.getResourceId(
        note.note.targetIdentifyingData,
        chainId,
        chainType
      );

      await noteManager.removeNote(noteResourceId, note);
    },
    [api, noteManager, notificationApi]
  );

  return {
    addNoteToNoteManager,
    api,
    cancel,
    error,
    removeNoteFromNoteManager,
    startNewTransaction: txQueueApi.startNewTransaction,
  };
};
