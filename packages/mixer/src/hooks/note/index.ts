import { ChainType, computeChainIdType, internalChainIdIntoEVMId } from '@webb-dapp/api-providers';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

async function mapNoteV1OrV2ToNoteV2(noteString: string): Promise<Note | null> {
  let d = await Note.deserialize(noteString);
  try {
    if (d.note.version === 'v1') {
      const newNoteInput: NoteGenInput = {
        protocol: d.note.protocol,
        version: 'v2',
        targetChain: computeChainIdType(
          ChainType.EVM,
          internalChainIdIntoEVMId(Number(d.note.sourceChainId))
        ).toString(),
        sourceChain: computeChainIdType(
          ChainType.EVM,
          internalChainIdIntoEVMId(Number(d.note.sourceChainId))
        ).toString(),
        sourceIdentifyingData: computeChainIdType(
          ChainType.EVM,
          internalChainIdIntoEVMId(Number(d.note.sourceChainId))
        ).toString(),
        targetIdentifyingData: computeChainIdType(
          ChainType.EVM,
          internalChainIdIntoEVMId(Number(d.note.sourceChainId))
        ).toString(),
        backend: d.note.backend,
        hashFunction: 'Poseidon',
        curve: d.note.curve,
        tokenSymbol: d.note.tokenSymbol,
        amount: d.note.amount,
        denomination: d.note.denomination,
        width: d.note.width,
        exponentiation: d.note.exponentiation,
        secrets: d.note.secrets,
      };
      let newNote = await Note.generateNote(newNoteInput);
      return newNote;
    } else {
      return d;
    }
  } catch (e) {
    console.log('passed value was: ', noteString);
    console.log('Error of: ', e);
    return null;
  }
}

export const useDepositNotes = (values: string[]): null | Note[] => {
  const [depositNotes, setDepositNotes] = useState<Note[] | null>(null);
  useEffect(() => {
    const handler = async () => {
      try {
        if (values.length === 0) {
          throw new Error('empty value');
        }
        const notes = await Promise.all(values.map((value) => mapNoteV1OrV2ToNoteV2(value)));
        // all notes are valid
        const allNotes = notes.reduce((acc, note) => acc && note !== null, true);
        if (allNotes) {
          setDepositNotes(notes as Note[]);
        }
      } catch (e) {
        console.log('passed value was: ', values);
        console.log('Error of: ', e);
        setDepositNotes(null);
      }
    };
    handler();
  }, [values]);

  return depositNotes;
};

export const useDepositNote = (value: string): null | Note => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        if (value === '') {
          throw new Error('empty value');
        }
        const note = await mapNoteV1OrV2ToNoteV2(value);
        setDepositNote(note);
      } catch (e) {
        console.log('passed value was: ', value);
        console.log('Error of: ', e);
        setDepositNote(null);
      }
    };
    handler();
  }, [value]);

  return depositNote;
};
