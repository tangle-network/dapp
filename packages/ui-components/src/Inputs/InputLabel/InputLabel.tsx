import { Typography } from '@material-ui/core';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React from 'react';
import styled, { css } from 'styled-components';

type LabelStatus = 'initial' | 'highlighted' | 'error';

interface InputLabelRootProps {
  state: LabelStatus;
}

interface InputLabelProps {
  state?: LabelStatus;
  label: string;
}

const InputLabelRoot = styled.label<InputLabelRootProps>`
  display: block;

  .label-content {
    font-size: 16px;
    font-family: ${FontFamilies.AvenirNext};
    font-weight: 300;
    display: block;
    margin-bottom: 5px;
  }
`;
export const InputLabel: React.FC<InputLabelProps> = ({ children, label, state = 'initial' }) => {
  return (
    <InputLabelRoot state={state}>
      <Typography className='label-content'>{label}</Typography>
      {children}
    </InputLabelRoot>
  );
};
