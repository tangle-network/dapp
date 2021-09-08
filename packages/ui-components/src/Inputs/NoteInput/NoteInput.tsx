import { FormHelperText, InputBase } from '@material-ui/core';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Note } from '@webb-tools/sdk-mixer';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getEVMChainName } from '@webb-dapp/apps/configs';

const NoteInputWrapper = styled.div``;
type NoteInputProps = {
  value: string;
  onChange(next: string): void;
  error?: string;
};
const NoteDetails = styled.div`
  ${({ theme }: { theme: Pallet }) => css`
    border-top: 2px solid ${theme.borderColor2};
  `};
  padding: 11px;
  margin: 0 -11px;
`;
export const NoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const [depositNote, setDepositNote] = useState<Note | null>(null);

  useEffect(() => {
    const handler = async () => {
      try {
        let d = await Note.deserialize(value);
        setDepositNote(d);
      } catch (_) {
        setDepositNote(null);
      }
    };
    handler();
  }, [value]);
  return (
    <InputLabel label={'Note'}>
      <InputBase
        fullWidth
        placeholder={`webb.mix:v1:4:Circom:Bn254:Poseidon:ETH:18:0.1:5:5:dc92b0096b02746362c56dbee8e28a036f29b600b59cad3e4a114af2e2eb094f9878beaf5699f43d789937130e7ee7ca12e0703ce9cc62297bbb0abc864e`}
        multiline={true}
        rows={5}
        value={value}
        inputProps={{ style: { fontSize: 14 } }}
        onChange={(event) => {
          onChange?.(event.target.value as string);
        }}
      />
      {depositNote && (
        <NoteDetails>
          <div>
            Context: {depositNote.note.prefix.replace('webb.', '')}
            <br />
            Amount : {depositNote.note.amount} {depositNote.note.tokenSymbol}
            <br />
            Chain : {getEVMChainName(parseInt(depositNote.note.chain))}
          </div>
        </NoteDetails>
      )}
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </InputLabel>
  );
};
