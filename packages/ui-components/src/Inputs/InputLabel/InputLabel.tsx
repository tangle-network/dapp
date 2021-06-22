import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React from 'react';
import styled, { css } from 'styled-components';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';

type LabelStatus = 'initial' | 'highlighted' | 'error';

interface InputLabelRootProps {
  state: LabelStatus;
}

interface InputLabelProps {
  state?: LabelStatus;
  label: string;
}

const InputLabelRoot = styled.label<InputLabelRootProps>`
  ${({ theme }: { theme: Pallet }) => css`
    border: 2px solid ${theme.borderColor2};
    color: ${theme.primaryText};
    background: ${theme.layer2Background};
  `}
  font-size: 13px;

  display: block;
  padding: 10px;
  border-radius: 10px;
  min-height: 80px;
  .label-content {
    font-family: ${FontFamilies.AvenirNext};
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
