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
        placeholder={`webb.mix-v1-EDG-0-13b564fcfacc0d2c0b8e2e2d5e36dd9065f2f7ff8ed01c83d9a62d4eb3c9490afdc603031110955d31289757926ee1c1e5d2f0d3377a6d085779c75367e89800`}
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
