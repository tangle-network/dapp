import { Typography } from '@mui/material';
import { FontFamilies } from '@nepoche/styled-components-theme';
import React from 'react';
import styled from 'styled-components';

type LabelStatus = 'initial' | 'highlighted' | 'error';

interface InputLabelRootProps {
  state: LabelStatus;
}

interface InputLabelProps {
  children: React.ReactNode;
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
