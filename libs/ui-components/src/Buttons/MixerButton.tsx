import { ButtonBase, ButtonBaseProps } from '@mui/material';
import { above } from '@nepoche/responsive-utils';
import React from 'react';
import styled, { css } from 'styled-components';

const MixerButtonWrapper = styled.button`
  &&& {
    width: 100%;
    background: ${({ theme }) => theme.accentColor};
    border-radius: 8px;
    color: #fff;
    padding: 8px 0px;
    transition: all ease-in-out 0.3s;
    font-weight: bold;

    ${({ disabled, theme }) => {
      return disabled
        ? css`
            background: ${theme.gray4};
          `
        : '';
    }}

    .mixer-button {
      text-transform: uppercase !important;
      font-size: 16px;
      font-weight: bold;
    }

    ${above.xs`
      padding: 16px 0px;
		`}
  }
`;

export type MixerButtonProps = {
  label?: string;
} & ButtonBaseProps;

export const MixerButton: React.FC<MixerButtonProps> = ({ children, label, ...props }) => {
  return (
    <MixerButtonWrapper as={ButtonBase} {...props}>
      {label ? <span className='mixer-button'>{label}</span> : children}
    </MixerButtonWrapper>
  );
};
