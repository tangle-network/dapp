import React from 'react';
import styled from 'styled-components';
import { ButtonBase, ButtonBaseProps } from '@material-ui/core';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';

const MixerButtonWrapper = styled.button`
  &&& {
    width: 100%;
    background: ${lightPallet.primary};
    border-radius: 31px;
    color: #fff;
    height: 60px;
    font-weight: bold;
  }
  .mixer-button {
    text-transform: uppercase !important;
    font-size: 18px;
  }
`;
type MixerButtonProps = {
  label?: string;
} & ButtonBaseProps;

export const MixerButton: React.FC<MixerButtonProps> = ({ label, children }) => {
  return (
    <MixerButtonWrapper as={ButtonBase}>
      {label ? <span className='mixer-button'>{label}</span> : children}
    </MixerButtonWrapper>
  );
};
