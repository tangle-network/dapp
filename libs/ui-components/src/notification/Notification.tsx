import { ButtonBase, Icon, Paper, Typography } from '@mui/material';
import { useColorPallet, lightPallet } from '@nepoche/styled-components-theme';
import { SnackbarKey, SnackbarMessage } from 'notistack';
import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';

import { SnackBarOpts } from './NotificationContext';

const AlertIconWrapper = styled.div<{ color: string }>`
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  background: ${({ color }) => color};
`;

const AlertCopyWrapper = styled.div`
  padding: 0 0.5rem;
  flex: 1;
  word-break: normal;
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
    background: ${({ color, theme }) =>
      color &&
      tinycolor(color)
        .setAlpha(theme.type === 'dark' ? 0.5 : 0.1)
        .toRgbString()};
    border-radius: 15px;
    position: relative;
    overflow: hidden;

    ::after {
      content: '';
      display: block;
      position: absolute;
      z-index: -1;
      background: ${({ theme }) => (theme.type === 'dark' ? '#000' : '#fff')};
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
  const pallet = useColorPallet();
  useEffect(
    () => () => {
      onUnmount?.($key);
    },
    [$key, onUnmount]
  );
  const AlertIcon = useMemo(() => {
    let iconName = '';
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
        return pallet.danger;
      case 'success':
        return pallet.success;
      case 'warning':
        return pallet.warning;
      case 'info':
        return pallet.info;
      default:
      case 'default':
        return lightPallet.componentBackground;
    }
  }, [opts, pallet]);
  const close = useCallback(() => opts.close($key), [$key, opts]);
  return (
    <AlertWrapper color={color} as={Paper} elevation={4}>
      <AlertIconWrapper color={opts.transparent ? 'rgba(0,0,0,0)' : color}>{AlertIcon}</AlertIconWrapper>
      <AlertCopyWrapper>
        {typeof opts.message === 'string' ? (
          <Typography variant={'h6'} component={'p'}>
            {opts.message}
          </Typography>
        ) : (
          opts.message
        )}
        <Typography variant={'h6'}>{opts.secondaryMessage}</Typography>
      </AlertCopyWrapper>
      <AlertActionsWrapper>
        <ButtonBase className='close-btn' onClick={close}>
          Dismiss
        </ButtonBase>
      </AlertActionsWrapper>
    </AlertWrapper>
  );
};
