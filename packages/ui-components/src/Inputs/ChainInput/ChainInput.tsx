import { InputBase } from '@material-ui/core';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import React from 'react';
import styled from 'styled-components';

const ChainInputWrapper = styled.div``;
type ChainInputProps = {};

export const ChainInput: React.FC<ChainInputProps> = ({}) => {
  return (
    <ChainInputWrapper>
      <InputLabel label={'Select Chain'}>
        <InputBase />
      </InputLabel>
    </ChainInputWrapper>
  );
};
