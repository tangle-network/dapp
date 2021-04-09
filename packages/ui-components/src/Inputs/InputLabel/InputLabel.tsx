import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import styled from 'styled-components';
import React from 'react';

type LabelStatus = 'initial' | 'highlighted' | 'error';

interface InputLabelRootProps {
  state: LabelStatus;
}

interface InputLabelProps {
  state?: LabelStatus;
  label: string;
}

const InputLabelRoot = styled.label<InputLabelRootProps>`
  font-size: 13px;
  border: 1px solid ${lightPallet.gray1};
  color: ${lightPallet.primaryText};
  display: block;
  padding: 10px;
  border-radius: 10px;
  min-height: 80px;

  .label-content {
    font-weight: 300;
    display: block;
    margin-bottom: 5px;
  }
`;
export const InputLabel: React.FC<InputLabelProps> = ({ children, label, state = 'initial' }) => {
  return (
    <InputLabelRoot state={state}>
      <span className='label-content'>{label}</span>
      {children}
    </InputLabelRoot>
  );
};
