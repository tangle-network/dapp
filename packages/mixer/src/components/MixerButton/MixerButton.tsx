/* eslint-disable @typescript-eslint/indent */
import { ButtonBase, ButtonBaseProps } from '@material-ui/core';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import React from 'react';
import styled, { css } from 'styled-components';

const MixerButtonWrapper = styled.button`
	&&& {
		width: 100%;
		background: ${lightPallet.primary};
		border-radius: 31px;
		color: #fff;
		height: 60px;
		font-weight: bold;
		transition: all ease-in-out .3s;

		${({ disabled }) => {
      return disabled
        ? css`
            background: ${lightPallet.gray4};
          `
        : '';
    }}
		.mixer-button {
			text-transform: uppercase !important;
			font-size: 18px;
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
