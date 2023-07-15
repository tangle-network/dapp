import { useWebContext } from '@webb-tools/api-provider-environment';
import { NoteManager } from '@webb-tools/note-manager';
import {
  calculateTypedChainId,
  Note,
  parseTypedChainId,
} from '@webb-tools/sdk-core';
import { isViemError } from '@webb-tools/web3-api-provider';
import { Button, Typography, useWebbUI } from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

type OnNewNotesCB = (note: Note[]) => Promise<void> | void;

type OnTryAgainCB = (
  onNewNotes?: OnNewNotesCB,
  onTryAgain?: OnTryAgainCB
) => Promise<void> | void;

export type UseNoteAccountReturnType = {
  /**
   * The notes map Map<chainId, Note[]>
   *
   */
  allNotes: Map<string, Note[]>;

  /**
   * The flag to indicate if the user has a note account
   */
  hasNoteAccount: boolean;

  /**
   * The flag to indicate if the notes are syncing
   */
  isSyncingNote: boolean;

  /**
   * The sync notes progress
   */
  syncNotesProgress: number;

  /**
   * The sync notes function
   * @param onNewNotes the callback called when user click the link on the notification
   * @param onTryAgain the callback called when user click the try again button on the notification
   */
  syncNotes: (
    onNewNotes?: OnNewNotesCB,
    onTryAgain?: OnTryAgainCB
  ) => Promise<void>;

  /**
   * The flag to indicate if the note account modal is open
   */
  isOpenNoteAccountModal: boolean;

  /**
   * The function to set the note account modal open
   * and sync the notes if the modal is closed
   */
  setOpenNoteAccountModal: (isOpen: boolean) => void;

  /**
   * The flag to indicate if the note account is successfully created
   */
  isSuccessfullyCreatedNoteAccount: boolean;

  /**
   * The function to set the note account successfully created
   */
  setSuccessfullyCreatedNoteAccount: (isSuccess: boolean) => void;
};

let isOpenNoteAccountModalSubject: BehaviorSubject<boolean>;

let isSuccessfullyCreatedNoteAccountSubject: BehaviorSubject<boolean>;

export const useNoteAccount = (): UseNoteAccountReturnType => {
  const { noteManager, activeApi, activeChain } = useWebContext();

  const { notificationApi } = useWebbUI();

  // State for loading spinner when syncing notes
  const [isSyncingNote, setIsSyncingNote] = useState(false);

  const [allNotes, setAllNotes] = useState<Map<string, Note[]>>(new Map());

  const [isOpenNoteAccountModal, setIsOpenNoteAccountModal] = useState(false);

  const [
    isSuccessfullyCreatedNoteAccount,
    setIsSuccessfullyCreatedNoteAccount,
  ] = useState(false);

  const syncNotesProgress = useObservableState(
    NoteManager.$syncNotesProgress,
    NaN
  );

  if (!isOpenNoteAccountModalSubject) {
    isOpenNoteAccountModalSubject = new BehaviorSubject(false);
  }

  if (!isSuccessfullyCreatedNoteAccountSubject) {
    isSuccessfullyCreatedNoteAccountSubject = new BehaviorSubject(false);
  }

  const hasNoteAccount = useMemo(() => Boolean(noteManager), [noteManager]);

  const handleSyncNotes = useCallback<UseNoteAccountReturnType['syncNotes']>(
    async (onNewNotes, onTryAgain) => {
      // Not ready for syncing notes
      if (!activeApi?.state?.activeBridge || !activeChain || !noteManager) {
        notificationApi.addToQueue({
          variant: 'error',
          message: 'Account sync failed',
          secondaryMessage: (
            <Typography variant="body1">
              Please make sure you have connected to a bridge and create an
              account note.{' '}
              <Button
                variant="link"
                className="inline-block"
                as="span"
                onClick={() => onTryAgain?.(onNewNotes, onTryAgain)}
              >
                Try again.
              </Button>
            </Typography>
          ),
        });
        return;
      }

      try {
        // Syncing notes
        noteManager.isSyncingNote = true;

        const chainNotes =
          await activeApi.methods.variableAnchor.actions.inner.syncNotesForKeypair(
            activeApi.state.activeBridge.targets[
              calculateTypedChainId(activeChain.chainType, activeChain.id)
            ],
            noteManager.getKeypair()
          );

        const notes = await Promise.all(
          chainNotes
            // Do not display notes that have zero value.
            .filter((note) => note.note.amount !== '0')
            .map(async (note) => {
              // Either contract address or tree id
              const targetIdentifier = note.note.targetIdentifyingData;
              const { chainType, chainId } = parseTypedChainId(
                +note.note.targetChainId
              );

              // Index the note by destination resource id
              const resourceId =
                await activeApi.methods.variableAnchor.actions.inner.getResourceId(
                  targetIdentifier,
                  chainId,
                  chainType
                );

              await noteManager.addNote(resourceId, note);
              return note;
            })
        );

        notificationApi.addToQueue({
          variant: 'success',
          message: 'Note(s) successfully added to account',
          secondaryMessage: (
            <Typography variant="body1">
              <Button
                variant="link"
                as="span"
                className="inline-block"
                onClick={() => onNewNotes?.(notes)}
              >
                {notes.length} new note(s){' '}
              </Button>{' '}
              added to your account
            </Typography>
          ),
        });
      } catch (error) {
        let msg = 'Something went wrong while syncing notes';

        if (isViemError(error)) {
          msg = error.shortMessage;
        }

        console.error('Error while syncing notes', error);
        console.dir(error);
        notificationApi.addToQueue({
          variant: 'error',
          message: msg,
        });
      } finally {
        noteManager.isSyncingNote = false;
      }
    },
    [activeApi, activeChain, noteManager, notificationApi]
  );

  const setOpenNoteAccountModal = useCallback(
    (isOpen: boolean) => {
      isOpenNoteAccountModalSubject.next(isOpen);

      const isNoteAccountCreated =
        isSuccessfullyCreatedNoteAccountSubject.value;

      // If the modal close and the user has a note account
      // then we will sync the notes
      if (!isOpen && isNoteAccountCreated) {
        handleSyncNotes().catch((error) => {
          console.log('Error while syncing notes', error);
        });
      }
    },
    [handleSyncNotes]
  );

  const setSuccessfullyCreatedNoteAccount = useCallback(
    (isSuccess: boolean) => {
      isSuccessfullyCreatedNoteAccountSubject.next(isSuccess);
    },
    []
  );

  // Effect to subscribe to noteManager
  useEffect(() => {
    if (!noteManager) {
      return;
    }

    // When the noteManager has its notes updated, update the react state for allNotes
    const noteUpdatedSub = noteManager.$notesUpdated.subscribe(() => {
      setAllNotes(new Map([...noteManager.getAllNotes()]));
    });

    // Subscribe to the noteManager syncing state
    const isSyncingSub = noteManager.$isSyncingNote.subscribe(
      (isSyncingNote) => {
        setIsSyncingNote(isSyncingNote);
      }
    );

    return () => {
      noteUpdatedSub.unsubscribe();
      isSyncingSub.unsubscribe();
    };
  }, [noteManager]);

  // Subscribe to the behavior subject
  useEffect(() => {
    const isOpenNoteAccountModalSub = isOpenNoteAccountModalSubject.subscribe(
      (isOpenNoteAccountModal) => {
        setIsOpenNoteAccountModal(isOpenNoteAccountModal);
      }
    );

    const isSuccessfullyCreatedNoteAccountSub =
      isSuccessfullyCreatedNoteAccountSubject.subscribe(
        (isSuccessfullyCreatedNoteAccount) => {
          setIsSuccessfullyCreatedNoteAccount(isSuccessfullyCreatedNoteAccount);
        }
      );

    return () => {
      isOpenNoteAccountModalSub.unsubscribe();
      isSuccessfullyCreatedNoteAccountSub.unsubscribe();
    };
  }, []);

  return {
    allNotes,
    hasNoteAccount,
    isOpenNoteAccountModal,
    isSuccessfullyCreatedNoteAccount,
    isSyncingNote,
    syncNotesProgress,
    setOpenNoteAccountModal,
    setSuccessfullyCreatedNoteAccount,
    syncNotes: handleSyncNotes,
  };
};
