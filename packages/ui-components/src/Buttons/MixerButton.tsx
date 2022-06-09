/* eslint-disable @typescript-eslint/indent */
import { ButtonBase, ButtonBaseProps } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';

import { above } from '../utils/responsive-utils';

const MixerButtonWrapper = styled.button`
  &&& {
    width: 100%;
    background: ${({ theme }) => theme.accentColor};
    border-radius: 8px;
    color: #fff;
    height: 40px;
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
      font-size: 18px;
      font-weight: bold;
    }

    ${above.xs`
			height: 60px;	
		`}
  }
`;

type MixerButtonProps = {
  label?: string;
} & ButtonBaseProps;

export const MixerButton: React.FC<MixerButtonProps> = ({ children, label, ...props }) => {
  return (
    <MixerButtonWrapper as={ButtonBase} {...props}>
      {label ? <span className='mixer-button'>{label}</span> : children}
    </MixerButtonWrapper>
  );
};
