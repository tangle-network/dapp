// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  NoteStorage,
  resetNoteStorage,
} from '@webb-tools/browser-utils/storage';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { parseUnits } from 'viem';
import {
  CircomUtxo,
  Keypair,
  Note,
  NoteGenInput,
  ResourceId,
  Utxo,
  UtxoGenInput,
  parseTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Storage } from '@webb-tools/storage';
import { hexToU8a } from '@webb-tools/utils';
import { Backend } from '@webb-tools/wasm-utils';
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
  // A notesMap will organize notes by typedChainId
  private notesMap: Map<string, Note[]>;

  private notesUpdatedSubject = new BehaviorSubject(false);

  private isSyncingNoteSubject = new BehaviorSubject(false);

  static readonly defaultNoteGenInput: DefaultNoteGenInput = {
    curve: 'Bn254',
    denomination: '18',
    exponentiation: '5',
    hashFunction: 'Poseidon',
    protocol: 'vanchor',
    version: 'v1',
    width: '5',
    index: 0,
  };

  private constructor(
    private noteStorage: Storage<NoteStorage>,
    private keypair: Keypair
  ) {
    this.notesMap = new Map();
  }

  /**
   * Get the resource id of the note
   * @param note the note to parse and get the resource id
   * @param isSource if true, get the resource id of the source chain,
   * otherwise get the resource id of the target chain
   */
  static getResourceId(note: Note, isSource?: boolean): ResourceId {
    const typedChainId = isSource
      ? note.note.sourceChainId
      : note.note.targetChainId;
    const { chainId, chainType } = parseTypedChainId(+typedChainId);

    const contractAddress = isSource
      ? note.note.sourceIdentifyingData
      : note.note.targetIdentifyingData;

    return new ResourceId(contractAddress, chainType, chainId);
  }

  static async initAndDecryptNotes(
    noteStorage: Storage<NoteStorage>,
    keypair: Keypair
  ): Promise<NoteManager> {
    const noteManager = new NoteManager(noteStorage, keypair);

    const encryptedNotesRecord = await noteStorage.dump();

    // 32-bytes size resource id where each byte is represented by 2 characters
    const resourceIdSize = 32 * 2;

    // Only get the stored notes with the key is the resource id
    const encryptedNotesMap = Object.entries(encryptedNotesRecord).reduce(
      (acc, [resourceIdOrTypedChainId, notes]) => {
        // Only get the notes where the key if resource id
        if (
          resourceIdOrTypedChainId.replace('0x', '').length === resourceIdSize
        ) {
          acc[resourceIdOrTypedChainId] = notes;
        }

        return acc;
      },
      {} as Record<string, Array<string>>
    );

    if (Object.keys(encryptedNotesMap).length > 0) {
      // decrypt notes and populate the notesMap of the noteManager
      await Promise.allSettled(
        Object.entries(encryptedNotesMap).map(
          async ([resourceIdStr, encryptedNotes]) => {
            // First decrypt the notes
            const decryptedNoteStrings = encryptedNotes
              .map((encNote) => {
                try {
                  return noteManager.keypair.decrypt(encNote).toString();
                } catch {
                  console.error(
                    `Failed to decrypt note: ${encNote}, keypair: ${noteManager.keypair}`
                  );
                  return null;
                }
              })
              .filter((note) => Boolean(note));

            const notes: Note[] = [];

            // Deserialize the decrypted notes
            for (const decNote of decryptedNoteStrings) {
              try {
                notes.push(await Note.deserialize(decNote));
              } catch (error) {
                console.error(
                  `Failed to deserialize note: ${decNote}, error: ${error}`
                );
              }
            }

            // TODO: Filter / other validation can occur on initialization as a
            // check against loading into the noteManager (maybe the note was stored,
            // but spent elsewhere?)
            if (notes.length > 0) {
              const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
              noteManager.notesMap.set(resourceId.toString(), notes);
            }
          }
        )
      );
    } else {
      // Set the encryptedNotes value in localStorage
      resetNoteStorage();
    }

    return noteManager;
  }

  // Trim the available notes to get the notes needed for a target amount.
  // It is assumed the notes passed are grouped for the same target and asset.
  static getNotesFifo(notes: Note[], targetAmount: bigint): Note[] | null {
    let currentAmount = ZERO_BIG_INT;
    const currentNotes: Note[] = [];

    for (const note of notes) {
      if (currentAmount >= targetAmount) {
        break;
      }

      currentAmount += BigInt(note.note.amount);
      currentNotes.push(note);
    }

    return currentAmount >= targetAmount ? currentNotes : null;
  }

  static keypairFromNote(note: Note): Keypair {
    const secrets = note.note.secrets.split(':');
    return new Keypair(`0x${secrets[2]}`);
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

  get defaultNoteGenInput(): DefaultNoteGenInput {
    return NoteManager.defaultNoteGenInput;
  }

  getKeypair() {
    return this.keypair;
  }

  getAllNotes(): Map<string, Note[]> {
    return this.notesMap;
  }

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

  async addNote(note: Note) {
    const resourceId = NoteManager.getResourceId(note).toString();
    const targetNotes = this.notesMap.get(resourceId);

    if (!targetNotes) {
      // Create a new entry into the notes map
      this.notesMap.set(resourceId, [note]);
    } else {
      // Check if this same note has already been added
      if (
        targetNotes.find(
          (storedNote) => storedNote.serialize() === note.serialize()
        )
      ) {
        return;
      }

      // Append the note to the existing available notes
      targetNotes.push(note);
      this.notesMap.set(resourceId, targetNotes);
    }
    this.notesUpdatedSubject.next(!this.notesUpdatedSubject.value);

    await this.updateStorage();
  }

  async removeNote(note: Note) {
    const resourceId = NoteManager.getResourceId(note).toString();

    // Remove the note from the local map
    const targetNotes = this.notesMap.get(resourceId);
    if (!targetNotes) {
      return;
    }

    const noteIndex = targetNotes.findIndex(
      (managedNote) => managedNote.serialize() === note.serialize()
    );
    targetNotes.splice(noteIndex, 1);
    if (targetNotes.length != 0) {
      this.notesMap.set(resourceId, targetNotes);
    } else {
      this.notesMap.delete(resourceId);
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
      await this.noteStorage.reset({});

      const promises = [...this.notesMap.entries()].map(
        async ([chain, notes]) => {
          const encNoteStrings = notes.map((note) => {
            const noteStr = note.serialize();
            return this.keypair.encrypt(Buffer.from(noteStr));
          });

          await this.noteStorage.set(chain, encNoteStrings);
        }
      );

      await Promise.all(promises);
    } else {
      resetNoteStorage();
    }
  }

  /**
   * Generate a note
   * @param sourceTypedChainId The source typed chain id
   * @param destTypedChainId The destination typed chain id
   * @param tokenSymbol The token symbol of the note
   * @param tokenDecimals The token decimals of the note
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
    tokenDecimals: number,
    amount: number | bigint
  ): Promise<Note> {
    let amountStr: string;

    if (typeof amount === 'number') {
      amountStr = parseUnits(amount.toString(), tokenDecimals).toString();
    } else {
      amountStr = amount.toString();
    }

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
