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
   */
  allNotes: Map<string, Note[]>;

  /**
   * The flag to indicate if all notes are initialized
   */
  allNotesInitialized: boolean;

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
    onTryAgain?: OnTryAgainCB,
    startingBlock?: bigint
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

const isOpenNoteAccountModalSubject = new BehaviorSubject(false);
const setIsOpenNoteAccountModal = (isOpen: boolean) =>
  isOpenNoteAccountModalSubject.next(isOpen);

const isSuccessfullyCreatedNoteAccountSubject = new BehaviorSubject(false);
const setIsSuccessfullyCreatedNoteAccount = (isSuccess: boolean) =>
  isSuccessfullyCreatedNoteAccountSubject.next(isSuccess);

export const useNoteAccount = (): UseNoteAccountReturnType => {
  const { noteManager, activeApi, activeChain } = useWebContext();

  const { notificationApi } = useWebbUI();

  // State for loading spinner when syncing notes
  const [isSyncingNote, setIsSyncingNote] = useState(false);

  const [allNotes, setAllNotes] = useState<Map<string, Note[]>>(new Map());
  const [allNotesInitialized, setAllNotesInitialized] = useState(false);

  const syncNotesProgress = useObservableState(
    NoteManager.$syncNotesProgress,
    NaN
  );

  const isOpenNoteAccountModal = useObservableState(
    isOpenNoteAccountModalSubject
  );

  const isSuccessfullyCreatedNoteAccount = useObservableState(
    isSuccessfullyCreatedNoteAccountSubject
  );

  const hasNoteAccount = useMemo(
    () => Boolean(noteManager?.getKeypair()),
    [noteManager]
  );

  const handleSyncNotes = useCallback<UseNoteAccountReturnType['syncNotes']>(
    async (onNewNotes, onTryAgain, startingBlock) => {
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

      const abortController = NoteManager.abortController;

      try {
        // Syncing notes
        noteManager.isSyncingNote = true;

        const chainNotes =
          await activeApi.methods.variableAnchor.actions.inner.syncNotesForKeypair(
            activeApi.state.activeBridge.targets[
              calculateTypedChainId(activeChain.chainType, activeChain.id)
            ],
            noteManager.getKeypair(),
            startingBlock,
            abortController.signal
          );

        const newNotes: Note[] = [];

        for (const note of chainNotes) {
          abortController.signal.throwIfAborted();

          // Not process the note with amount 0
          if (note.note.amount === '0') {
            continue;
          }

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

          const existed = noteManager
            .getNotesOfChain(resourceId.toString())
            ?.find((storedNote) => storedNote.serialize() === note.serialize());

          if (!existed) {
            await noteManager.addNote(resourceId, note);
            newNotes.push(note);
          }
        }

        notificationApi.addToQueue({
          variant: 'success',
          message:
            newNotes.length > 0
              ? `Note${
                  newNotes.length > 1 ? 's' : ''
                } successfully added to account`
              : 'Successfully synced notes',
          secondaryMessage:
            newNotes.length > 0 ? (
              <Typography variant="body1">
                <Button
                  variant="link"
                  as="span"
                  className="inline-block"
                  onClick={() => onNewNotes?.(newNotes)}
                >
                  {newNotes.length} new note(s){' '}
                </Button>{' '}
                added to your account
              </Typography>
            ) : undefined,
        });
      } catch (error) {
        // If the abort controller is not aborted, then we will show the error
        if (!abortController.signal.aborted) {
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
        }
      } finally {
        noteManager.isSyncingNote = false;
      }
    },
    [activeApi, activeChain, noteManager, notificationApi]
  );

  // Effect to subscribe to noteManager
  useEffect(() => {
    if (!noteManager) {
      setAllNotesInitialized(true);
      return;
    }

    // When the noteManager has its notes updated, update the react state for allNotes
    const noteUpdatedSub = noteManager.$notesUpdated.subscribe(() => {
      setAllNotes(new Map([...noteManager.getAllNotes()]));
      setAllNotesInitialized(true);
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

  return {
    allNotes,
    allNotesInitialized,
    hasNoteAccount,
    isOpenNoteAccountModal,
    isSuccessfullyCreatedNoteAccount,
    isSyncingNote,
    syncNotesProgress,
    setOpenNoteAccountModal: setIsOpenNoteAccountModal,
    setSuccessfullyCreatedNoteAccount: setIsSuccessfullyCreatedNoteAccount,
    syncNotes: handleSyncNotes,
  };
};
