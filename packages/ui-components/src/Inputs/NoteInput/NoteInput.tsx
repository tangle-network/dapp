import { FormHelperText, InputBase } from '@material-ui/core';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import React from 'react';
import styled from 'styled-components';

const NoteInputWrapper = styled.div``;
type NoteInputProps = {
  value: string;
  onChange(next: string): void;
  error?: string;
};

export const NoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
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
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </InputLabel>
  );
};
