import {
  ChainType,
  computeChainIdType,
  internalChainIdIntoEVMId,
} from '@webb-dapp/apps/configs';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useDepositNote = (value: string): null | Note => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        if (value === '') throw new Error('empty value');
        let d = await Note.deserialize(value);
        // const noteLeaf = d.getLeaf();
        // console.log('noteLeaf: ', noteLeaf.toString());
        console.log('Note: ', d.note);
        // Check for legacy notes and update fields (like internal chain id -> chain id type)
        if (d.note.version === 'v1') {
          console.log('useDepositNote: detected v1');
          const newNoteInput: NoteGenInput = {
            protocol: d.note.protocol,
            version: 'v2',
            targetChain: computeChainIdType(ChainType.EVM, internalChainIdIntoEVMId(Number(d.note.sourceChainId))).toString(),
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
          console.log('right before setDepositNote', newNote);
          setDepositNote(newNote);
        } else {
          setDepositNote(d);
        }
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
