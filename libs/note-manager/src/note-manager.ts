// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { NoteStorage } from '@webb-tools/browser-utils/storage';
import { getLatestAnchorAddress } from '@webb-tools/dapp-config';
import {
  CircomUtxo,
  Keypair,
  Note,
  NoteGenInput,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Storage } from '@webb-tools/storage';
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';

// A NoteManager will manage the notes for a keypair.
export class NoteManager {
  // A notesMap will organize notes by typedChainId
  private notesMap: Map<string, Note[]>;

  private notesUpdatedSubject = new BehaviorSubject(false);

  private isSyncingNoteSubject = new BehaviorSubject(false);

  private constructor(
    private noteStorage: Storage<NoteStorage>,
    private keypair: Keypair
  ) {
    this.notesMap = new Map();
  }

  static async initAndDecryptNotes(
    noteStorage: Storage<NoteStorage>,
    keypair: Keypair
  ): Promise<NoteManager> {
    const noteManager = new NoteManager(noteStorage, keypair);

    const encryptedNotesMap = await noteStorage.get('encryptedNotes');

    if (encryptedNotesMap) {
      // decrypt notes and populate the notesMap of the noteManager
      await Promise.all(
        Object.entries(encryptedNotesMap).map(async (entry) => {
          const decryptedNoteStrings = entry[1].map((encNote) => {
            return noteManager.keypair.decrypt(encNote).toString();
          });

          const notes: Note[] = [];

          for (const decNote of decryptedNoteStrings) {
            notes.push(await Note.deserialize(decNote));
          }

          // TODO: Filter / other validation can occur on initialization as a
          // check against loading into the noteManager (maybe the note was stored,
          // but spent elsewhere?)
          if (notes.length > 0) {
            noteManager.notesMap.set(entry[0], notes);
          }
        })
      );
    } else {
      // Set the encryptedNotes value in localStorage
      noteStorage.set('encryptedNotes', {});
    }

    return noteManager;
  }

  // Trim the available notes to get the notes needed for a target amount.
  // It is assumed the notes passed are grouped for the same target and asset.
  static getNotesFifo(
    notes: Note[],
    targetAmount: ethers.BigNumber
  ): Note[] | null {
    let currentAmount = ethers.BigNumber.from(0);
    const currentNotes: Note[] = [];

    for (const note of notes) {
      if (currentAmount.gte(targetAmount)) {
        break;
      }

      currentAmount = currentAmount.add(note.note.amount);
      currentNotes.push(note);
    }

    return currentAmount.gte(targetAmount) ? currentNotes : null;
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

  getKeypair() {
    return this.keypair;
  }

  getAllNotes(): Map<string, Note[]> {
    return this.notesMap;
  }

  getNotesOfChain(typedChainId: number): Note[] | undefined {
    return this.notesMap.get(typedChainId.toString());
  }

  // Return enough notes to satisfy the amount
  // Returns null if it cannot satisfy
  getNotesForTransact(
    typedChainId: number,
    amount: ethers.BigNumber
  ): Note[] | null {
    const currentAmount = ethers.BigNumber.from(0);
    const currentNotes: Note[] = [];

    const availableNotes = this.notesMap.get(typedChainId.toString());

    if (!availableNotes) {
      return null;
    }

    while (currentAmount.lt(amount)) {
      const currentNote = availableNotes.pop();

      if (!currentNote) {
        return null;
      }

      currentAmount.add(currentNote.note.amount);
      currentNotes.push(currentNote);
    }

    return currentNotes;
  }

  getWithdrawableAmount(
    typedChainId: number,
    tokenName: string
  ): ethers.BigNumber {
    const availableChainNotes = this.notesMap.get(typedChainId.toString());
    const amount: ethers.BigNumber = ethers.BigNumber.from(0);

    availableChainNotes
      ?.filter((note) => note.note.tokenSymbol === tokenName)
      .map((note) => {
        amount.add(note.note.amount);
      });

    return amount;
  }

  async addNote(note: Note) {
    const targetNotes = this.notesMap.get(note.note.targetChainId);

    if (!targetNotes) {
      // Create a new entry into the notes map
      this.notesMap.set(note.note.targetChainId, [note]);
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
      this.notesMap.set(note.note.targetChainId, targetNotes);
    }
    this.notesUpdatedSubject.next(!this.notesUpdatedSubject.value);

    await this.updateStorage();
  }

  async removeNote(note: Note) {
    // Remove the note from the local map
    const targetNotes = this.notesMap.get(note.note.targetChainId);
    if (!targetNotes) {
      return;
    }

    const noteIndex = targetNotes.findIndex(
      (managedNote) => managedNote.serialize() === note.serialize()
    );
    targetNotes.splice(noteIndex, 1);
    if (targetNotes.length != 0) {
      this.notesMap.set(note.note.targetChainId, targetNotes);
    } else {
      this.notesMap.delete(note.note.targetChainId);
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
    const encryptedNotes: Record<string, string[]> = {};

    for (const chainGroupedNotes of this.notesMap.entries()) {
      const encNoteStrings = chainGroupedNotes[1].map((note) => {
        const noteStr = note.serialize();
        return this.keypair.encrypt(Buffer.from(noteStr));
      });

      encryptedNotes[chainGroupedNotes[0]] = encNoteStrings;
    }

    await this.noteStorage.set('encryptedNotes', encryptedNotes);
    return;
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
    sourceTypedChainId: number,
    destTypedChainId: number,
    tokenSymbol: string,
    tokenDecimals: number,
    amount: number
  ): Promise<Note> {
    const amountBigNumber = ethers.utils
      .parseUnits(amount.toString(), tokenDecimals)
      .toString();

    // Convert the amount to units of wei
    const outputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: amountBigNumber,
      originChainId: sourceTypedChainId.toString(),
      chainId: destTypedChainId.toString(),
      keypair: this.keypair,
    });

    const srcAddress = getLatestAnchorAddress(sourceTypedChainId);
    const destAddress = getLatestAnchorAddress(destTypedChainId);
    if (!srcAddress || !destAddress) {
      throw new Error('No anchor address found');
    }

    const noteInput: NoteGenInput = {
      amount: amountBigNumber,
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      secrets: [
        toFixedHex(destTypedChainId, 8).substring(2),
        toFixedHex(outputUtxo.amount, 16).substring(2),
        toFixedHex(this.keypair.privkey).substring(2),
        toFixedHex(`0x${outputUtxo.blinding}`).substring(2),
      ].join(':'),
      sourceChain: sourceTypedChainId.toString(),
      sourceIdentifyingData: srcAddress,
      targetChain: destTypedChainId.toString(),
      targetIdentifyingData: destAddress,
      tokenSymbol: tokenSymbol,
      version: 'v1',
      width: '5',
    };

    return Note.generateNote(noteInput);
  }
}
