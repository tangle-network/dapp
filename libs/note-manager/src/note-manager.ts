// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  MultiAccountNoteStorage,
  getV1NotesRecord,
  multiAccountNoteStorageFactory,
  resetMultiAccountNoteStorage,
} from '@webb-tools/browser-utils/storage';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import Storage from '@webb-tools/dapp-types/Storage';
import {
  CircomUtxo,
  Keypair,
  Note,
  NoteGenInput,
  ResourceId,
  Utxo,
  UtxoGenInput,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { hexToU8a, Backend } from '@webb-tools/utils';
import mergeWith from 'lodash/mergeWith';
import transform from 'lodash/transform';
import uniqBy from 'lodash/uniqBy';
import { BehaviorSubject } from 'rxjs';

type DefaultNoteGenInput = Pick<
  NoteGenInput,
  | 'curve'
  | 'denomination'
  | 'exponentiation'
  | 'hashFunction'
  | 'protocol'
  | 'version'
  | 'width'
  | 'index'
>;

// A NoteManager will manage the notes for a keypair.
export class NoteManager {
  // Map that stores notes grouped by their associated string keys.
  private notesMap: Map<string, Note[]>;

  // A subject that emits when the notes are updated.
  private notesUpdatedSubject = new BehaviorSubject(false);

  // A subject that emits when the notes are being synced.
  private isSyncingNoteSubject = new BehaviorSubject(false);

  /**
   * A subject that emits the progress of syncing notes.
   * The value is a 2-decimal point percentage of the progress
   * or NaN if the progress is not started.
   */
  private static syncNotesProgressSubject = new BehaviorSubject(NaN);

  // A static abort controller for aborting the sync notes progress
  static #abortController = new AbortController();

  // The default note generation input
  static readonly defaultNoteGenInput = {
    curve: 'Bn254',
    denomination: '18',
    exponentiation: '5',
    hashFunction: 'Poseidon',
    protocol: 'vanchor',
    version: 'v1',
    width: '5',
    index: 0,
  } as const satisfies DefaultNoteGenInput;

  private constructor(
    private multiAccountNoteStorage: Storage<MultiAccountNoteStorage>,
    private keypair: Keypair
  ) {
    this.notesMap = new Map();
    NoteManager.syncNotesProgressSubject.next(NaN);

    // Abort the sync notes progress when the note manager is destroyed
    NoteManager.#abortController.abort();

    // Create a new abort controller
    NoteManager.#abortController = new AbortController();
  }

  // Trim the available notes to get the notes needed for a target amount.
  // It is assumed the notes passed are grouped for the same target and asset.
  static getNotesFifo(notes: Note[], targetAmount: bigint): Note[] | null {
    let currentAmount = ZERO_BIG_INT;
    const currentNotes: Note[] = [];

    const sortedNotes = NoteManager.sortNotes(notes);
    for (const note of sortedNotes) {
      if (currentAmount >= targetAmount) {
        break;
      }

      currentAmount += BigInt(note.note.amount);
      currentNotes.push(note);
    }

    return currentAmount >= targetAmount ? currentNotes : null;
  }

  // Retrieve the keypair from a note
  static keypairFromNote(note: Note): Keypair {
    const secrets = note.note.secrets.split(':');
    return new Keypair(`0x${secrets[2]}`);
  }

  /**
   * Sort the notes by indx in ascending order
   * and the zero and undefined index will be put at the end
   * @param notes the notes to sort
   */
  static sortNotes(notes: ReadonlyArray<Note>): ReadonlyArray<Note> {
    return notes.slice().sort((a, b) => {
      // Place undefined values at the end
      if (!a.note.index) {
        return 1;
      }

      if (!b.note.index) {
        return -1;
      }

      const aIndex = BigInt(a.note.index);
      const bIndex = BigInt(b.note.index);

      // Place zero values before undefined but after other numbers
      if (aIndex === ZERO_BIG_INT) {
        return 1;
      }

      if (bIndex === ZERO_BIG_INT) {
        return -1;
      }

      // Regular ascending sort for other numbers
      const idx = aIndex - bIndex;

      return idx > 0 ? 1 : idx < 0 ? -1 : 0;
    });
  }

  // Initialize the note manager with the given keypair.
  static async initAndDecryptNotes(keypair: Keypair): Promise<NoteManager> {
    const notesRecord = await NoteManager.decryptNotes(
      await getV1NotesRecord(),
      keypair
    );

    const multiAccNoteStorage = await multiAccountNoteStorageFactory();
    const noteManager = new NoteManager(multiAccNoteStorage, keypair);

    const multiAccountNotesData = await multiAccNoteStorage.dump();
    const accountPubKey = keypair.getPubKey();

    const encNotes = multiAccountNotesData[accountPubKey] ?? {};

    if (Object.keys(encNotes).length === 0) {
      resetMultiAccountNoteStorage(accountPubKey);
    }

    const multiAccNotesRecord = await NoteManager.decryptNotes(
      encNotes,
      keypair
    );

    // Merge the v1 notes record with the multi account note record
    mergeWith(
      notesRecord,
      multiAccNotesRecord,
      (objectValue: Array<Note> = [], sourceValue: Array<Note> = []) => {
        return uniqBy(objectValue.concat(sourceValue), (note) =>
          note.serialize()
        );
      }
    );

    const isEqual = compareNotesRecord(notesRecord, multiAccNotesRecord);

    // If the encNotes is not equal to the noteRecord,
    // then update the multi account note storage
    if (!isEqual) {
      await multiAccNoteStorage.set(
        accountPubKey,
        transform(notesRecord, (result, value, key) => {
          result[key] = value.map((note) => note.serialize());
        })
      );
    }

    noteManager.notesMap = new Map(Object.entries(notesRecord));

    return noteManager;
  }

  // Decrypt the notes and return a record of notes grouped by their resource id.
  static async decryptNotes(
    encryptedNotes: MultiAccountNoteStorage[string],
    keypair: Keypair
  ) {
    const notesRecord: Record<string, Note[]> = {};

    // decrypt notes and populate the notesMap of the noteManager
    await Promise.allSettled(
      Object.entries(encryptedNotes).map(
        async ([resourceIdStr, encryptedNotes]) => {
          // First decrypt the notes
          const decryptedNoteStrings = encryptedNotes
            .map((encNote) => {
              try {
                return keypair.decrypt(encNote).toString();
              } catch {
                // Ignore the note if it cannot be decrypted
                return null;
              }
            })
            .filter((note): note is string => Boolean(note));

          const notes: Note[] = [];

          // Deserialize the decrypted notes
          for (const decNote of decryptedNoteStrings) {
            try {
              notes.push(await Note.deserialize(decNote));
            } catch {
              // Ignore the note if it cannot be deserialized
            }
          }

          // TODO: Filter / other validation can occur on initialization as a
          // check against loading into the noteManager (maybe the note was stored,
          // but spent elsewhere?)
          if (notes.length > 0) {
            const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
            notesRecord[resourceId.toString()] = notes;
          }
        }
      )
    );

    return notesRecord;
  }

  static async noteFromUtxo(
    utxo: Utxo,
    backend: Backend,
    srcTypedChainId: number,
    srcAnchorId: string,
    destAnchorId: string,
    tokenSymbol: string
  ): Promise<Note> {
    const secrets = [
      toFixedHex(utxo.chainId, 8),
      toFixedHex(utxo.amount),
      utxo.secret_key,
      utxo.blinding,
    ].join(':');

    return Note.generateNote({
      ...NoteManager.defaultNoteGenInput,
      amount: utxo.amount,
      backend: backend,
      index: utxo.index,
      privateKey: hexToU8a(utxo.secret_key),
      secrets,
      sourceChain: srcTypedChainId.toString(),
      sourceIdentifyingData: srcAnchorId,
      targetChain: utxo.chainId,
      targetIdentifyingData: destAnchorId,
      tokenSymbol: tokenSymbol,
    });
  }

  get $notesUpdated() {
    return this.notesUpdatedSubject.asObservable();
  }

  get notesUpdated() {
    return this.notesUpdatedSubject.getValue();
  }

  get $isSyncingNote() {
    return this.isSyncingNoteSubject.asObservable();
  }

  get isSyncingNote() {
    return this.isSyncingNoteSubject.getValue();
  }

  set isSyncingNote(value: boolean) {
    this.isSyncingNoteSubject.next(value);
  }

  get defaultNoteGenInput() {
    return NoteManager.defaultNoteGenInput;
  }

  static get $syncNotesProgress() {
    return this.syncNotesProgressSubject.asObservable();
  }

  static get syncNotesProgress() {
    return this.syncNotesProgressSubject.getValue();
  }

  static set syncNotesProgress(value: number) {
    this.syncNotesProgressSubject.next(value);
  }

  static get abortController() {
    return this.#abortController;
  }

  // Get the keypair associated with this note manager.
  getKeypair() {
    return this.keypair;
  }

  // Get all the notes managed by this note manager.
  getAllNotes(): Map<string, Note[]> {
    return this.notesMap;
  }

  // Get the notes associated with a resource id.
  getNotesOfChain(resourceId: string): Note[] | undefined {
    return this.notesMap.get(resourceId);
  }

  // Return enough notes to satisfy the amount
  // Returns null if it cannot satisfy
  getNotesForTransact(resourceId: string, amount: bigint): Note[] | null {
    let currentAmount = ZERO_BIG_INT;
    const currentNotes: Note[] = [];

    const availableNotes = this.notesMap.get(resourceId);

    if (!availableNotes) {
      return null;
    }

    while (currentAmount < amount) {
      const currentNote = availableNotes.pop();

      if (!currentNote) {
        return null;
      }

      currentAmount += BigInt(currentNote.note.amount);
      currentNotes.push(currentNote);
    }

    return currentNotes;
  }

  getWithdrawableAmount(resourceId: string, tokenName: string): bigint {
    const availableChainNotes = this.notesMap.get(resourceId);
    let amount = ZERO_BIG_INT;

    availableChainNotes
      ?.filter((note) => note.note.tokenSymbol === tokenName)
      .map((note) => {
        amount += BigInt(note.note.amount);
      });

    return amount;
  }

  async addNote(resourceId: ResourceId, note: Note) {
    const resourceIdStr = resourceId.toString();
    const targetNotes = this.notesMap.get(resourceIdStr);

    if (!targetNotes) {
      // Create a new entry into the notes map
      this.notesMap.set(resourceIdStr, [note]);
    } else {
      const newTargetNotes = addNoteWithoutDuplicates(targetNotes, note);
      if (newTargetNotes) {
        this.notesMap.set(resourceIdStr, newTargetNotes);
      }
    }

    this.notesUpdatedSubject.next(!this.notesUpdatedSubject.value);
    await this.updateStorage();
  }

  async removeNote(resourceId: ResourceId, note: Note) {
    const resourceIdStr = resourceId.toString();

    // Remove the note from the local map
    const targetNotes = this.notesMap.get(resourceIdStr);
    if (!targetNotes) {
      return;
    }

    const noteIndex = targetNotes.findIndex(
      (managedNote) => managedNote.serialize() === note.serialize()
    );

    if (noteIndex === -1) {
      return;
    }

    targetNotes.splice(noteIndex, 1);
    if (targetNotes.length != 0) {
      this.notesMap.set(resourceIdStr, targetNotes);
    } else {
      this.notesMap.delete(resourceIdStr);
    }

    this.notesUpdatedSubject.next(!this.notesUpdatedSubject.value);

    await this.updateStorage();
  }

  async removeAllNotes() {
    this.notesMap = new Map<string, Note[]>();

    this.notesUpdatedSubject.next(!this.notesUpdatedSubject.value);

    await this.updateStorage();
  }

  async updateStorage() {
    if (this.notesMap.size !== 0) {
      const pubKey = this.keypair.getPubKey();
      await this.multiAccountNoteStorage.set(pubKey, {});

      const encryptedNotesRecord = Array.from(this.notesMap.entries()).reduce(
        (prev, [resourceId, notes]) => {
          const encNoteStrings = notes.map((note) => {
            const noteStr = note.serialize();
            return this.keypair.encrypt(Buffer.from(noteStr));
          });

          prev[resourceId] = encNoteStrings;

          return prev;
        },
        {} as MultiAccountNoteStorage[string]
      );

      await this.multiAccountNoteStorage.set(pubKey, encryptedNotesRecord);
    } else {
      resetMultiAccountNoteStorage(this.keypair.getPubKey());
    }
  }

  /**
   * Generate a note
   * @param backend The backend - either 'Arkworks' or 'Circom'
   * @param sourceTypedChainId The source typed chain id
   * @param sourceAnchorAddress The source anchor address
   * @param destTypedChainId The destination typed chain id
   * @param destAnchorAddress The destination anchor address
   * @param tokenSymbol The token symbol of the note
   * @param amount The amount of the note
   * @returns The generated note
   */
  async generateNote(
    backend: Backend,
    sourceTypedChainId: number,
    sourceAnchorAddress: string,
    destTypedChainId: number,
    destAnchorAddress: string,
    tokenSymbol: string,
    amount: bigint
  ): Promise<Note> {
    if (!this.keypair.privkey) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const amountStr = amount.toString();

    const input: UtxoGenInput = {
      curve: this.defaultNoteGenInput.curve,
      backend,
      amount: amountStr,
      originChainId: sourceTypedChainId.toString(),
      chainId: destTypedChainId.toString(),
      keypair: this.keypair,
      index: this.defaultNoteGenInput.index.toString(),
    };

    // Convert the amount to units of wei
    const utxo = await CircomUtxo.generateUtxo(input);

    const noteInput: NoteGenInput = {
      ...this.defaultNoteGenInput,
      amount: amountStr,
      backend,
      secrets: [
        toFixedHex(destTypedChainId, 8).substring(2),
        toFixedHex(utxo.amount).substring(2),
        toFixedHex(this.keypair.privkey).substring(2),
        toFixedHex(`0x${utxo.blinding}`).substring(2),
      ].join(':'),
      sourceChain: sourceTypedChainId.toString(),
      sourceIdentifyingData: sourceAnchorAddress,
      targetChain: destTypedChainId.toString(),
      targetIdentifyingData: destAnchorAddress,
      tokenSymbol: tokenSymbol,
      index: utxo.index,
    };

    return Note.generateNote(noteInput);
  }
}

type NoteRecord = Record<string, Note[]>;

/** @internal */
function compareNotesRecord(
  notesRecord: NoteRecord,
  otherNotesRecord: NoteRecord
) {
  if (
    Object.keys(notesRecord).length !== Object.keys(otherNotesRecord).length
  ) {
    return false;
  }

  function compareLeftRight(left: NoteRecord, right: NoteRecord) {
    for (const [key, notes] of Object.entries(left)) {
      const otherNotes = right[key];

      if (!otherNotes) {
        return false;
      }

      if (notes.length !== otherNotes.length) {
        return false;
      }

      for (const note of notes) {
        if (
          !otherNotes.find(
            (otherNote) => otherNote.serialize() === note.serialize()
          )
        ) {
          return false;
        }
      }
    }

    return true;
  }

  return (
    compareLeftRight(notesRecord, otherNotesRecord) &&
    compareLeftRight(otherNotesRecord, notesRecord)
  );
}

/**
 * There is a case where the new note has a different index
 * with the stored note but the same other properties.
 * In this case, we should remove the stored note and add the new note.
 * This function will modify the passed array in place.
 * @param arr the existing notes
 * @param newNote the new note to be added
 */
function addNoteWithoutDuplicates(arr: Note[], newNote: Note) {
  const noteWithoutIndex = newNote
    .serialize()
    .split('&')
    .filter((part) => !part.startsWith('index'))
    .join('&');

  const matchedIndex = arr.findIndex((storedNote) => {
    const storedNoteWithoutIndex = storedNote
      .serialize()
      .split('&')
      .filter((part) => !part.startsWith('index'))
      .join('&');

    return storedNoteWithoutIndex === noteWithoutIndex;
  });

  const newArr = arr.slice();

  // If the stored note has the same index as the note to be added,
  // then ignore the note to be added
  if (
    matchedIndex !== -1 &&
    arr[matchedIndex].note.index === newNote.note.index
  ) {
    return;
  } else if (matchedIndex !== -1) {
    // If the stored note has a different index with the note to be added,
    // then remove the stored note
    newArr.splice(matchedIndex, 1);
  }

  // Append the note to the existing available notes
  newArr.push(newNote);
  return newArr;
}
