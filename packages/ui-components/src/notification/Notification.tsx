import { ButtonBase, Icon, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { SnackbarKey, SnackbarMessage } from 'notistack';
import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';

import { SnackBarOpts } from './NotificationContext';

const AlertIconWrapper = styled.div<{ color: string }>`
  padding: 0 0.5rem;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: ${({ color }) => color};
`;

const AlertCopyWrapper = styled.div`
  padding: 0 0.5rem;
  flex: 1;
`;

const AlertActionsWrapper = styled.div`
  .close-btn {
    background: #ffffff;
    box-shadow: 0px 0px 13px rgba(54, 86, 233, 0.1);
    border-radius: 47px;
    padding: 0.5rem 1rem;
    font-size: 12px;
    line-height: 128.6%;
    color: #000000;
  }
`;
const AlertWrapper = styled.div<{ color: string }>`
  &&& {
    padding: 0.25rem 1rem;
    width: 400px;
    max-width: 80vw;
    display: flex;
    align-items: center;
    min-height: 80px;
    //background: rgba(239, 241, 244, 1);
    background: ${({ color }) => color && tinycolor(color).setAlpha(0.1).toRgbString()};
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    ::after {
      content: '';
      display: block;
      position: absolute;
      z-index: -1;
      background: #fff;
      width: 100%;
      height: 100%;
      left: 0;
    }
  }
`;

export const Alert: React.FC<{
  message: SnackbarMessage;
  opts: SnackBarOpts;
  $key: SnackbarKey;
  onUnmount?(key: SnackbarKey): void;
}> = ({ $key, onUnmount, opts }) => {
  useEffect(
    () => () => {
      onUnmount?.($key);
    },
    [$key, onUnmount]
  );
  const AlertIcon = useMemo(() => {
    let iconName: string = '';
    if (opts.Icon) {
      return opts.Icon;
    }
    switch (opts.variant) {
      case 'default':
        iconName = 'notifications';
        break;
      case 'error':
        iconName = 'error';
        break;
      case 'success':
        iconName = 'task_alt';
        break;
      case 'warning':
        iconName = 'warning';
        break;
      case 'info':
        iconName = 'info';
        break;
    }
    return <Icon>{iconName}</Icon>;
  }, [opts]);
  const color = useMemo(() => {
    switch (opts.variant) {
      case 'error':
        return lightPallet.danger;
      case 'success':
        return lightPallet.success;
      case 'warning':
        return lightPallet.warning;
      case 'info':
        return lightPallet.info;
      default:
      case 'default':
        return lightPallet.mainBackground;
    }
  }, [opts]);
  const close = useCallback(() => opts.close($key), [$key, opts]);
  return (
    <AlertWrapper color={color} as={Paper} elevation={4}>
      <AlertIconWrapper color={opts.transparent ? 'rgba(0,0,0,0)' : color}>{AlertIcon}</AlertIconWrapper>
      <AlertCopyWrapper>
        <Typography>{opts.message}</Typography>
        <Typography>{opts.secondaryMessage}</Typography>
      </AlertCopyWrapper>
      <AlertActionsWrapper>
        <ButtonBase className='close-btn' onClick={close}>
          Dismiss
        </ButtonBase>
      </AlertActionsWrapper>
    </AlertWrapper>
  );
};
