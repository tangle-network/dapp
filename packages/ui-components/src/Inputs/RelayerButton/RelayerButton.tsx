import { SettingsIcon } from '@webb-dapp/ui-components/assets/SettingsIcon';
import React from 'react';
import styled from 'styled-components';

import { RelayerButtonProp } from './relayer-label-props.interface';
import { RelayerSettings } from './styled';

export const RelayerButton: React.FC<RelayerButtonProp> = ({ disabled, hasIcon = true, onClick }) => {
  return (
    <RelayerSettings role='button' aria-disabled={disabled} onClick={onClick} className='select-button'>
      {hasIcon && <SettingsIcon />}
      <p style={{ fontSize: '14px', color: '#B6B6B6', marginLeft: '5px' }}>RELAYER</p>
    </RelayerSettings>
  );
};
