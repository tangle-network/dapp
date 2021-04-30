import { Button, ButtonBase, Icon, Paper, PaperProps } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { SnackBarOpts } from '@webb-dapp/ui-components/Notification/StackedSnackBar';
import { SnackbarKey, SnackbarMessage } from 'notistack';
import Typography from '@material-ui/core/Typography';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import tinycolor from 'tinycolor2';
const lightenRate = 5;
const darkenRate = 15;
type NotificationProps = {};

const intoJson = <T extends Record<string, unknown>>(str: string): T | null => {
  try {
    return JSON.parse(str);
  } catch (_) {
    return null;
  }
};

type AlertOptions = {
  message: string;
  variant: string;
  icon: string;
  secondaryAction: string;
};

const messageAdapter = (message: string) => {
  const conf = intoJson(message);
};
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
  padding: 0 0.5rem;

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
  padding: 0.25rem 1rem;
  width: 400px;
  max-width: 80vw;
  display: flex;
  align-items: center;
  min-height: 80px;
  //background: rgba(239, 241, 244, 1);
  background: ${({ color }) => color && tinycolor(color).setAlpha(0.1).toRgbString()};
  border-radius: 15px;
`;

export const Alert: React.FC<{
  message: SnackbarMessage;
  opts: SnackBarOpts;
  $key: SnackbarKey;
  onUnmount?(key: SnackbarKey): void;
}> = ({ onUnmount, $key, opts }) => {
  useEffect(
    () => () => {
      onUnmount?.($key);
    },
    [$key]
  );
  const AlertIcon = useMemo(() => {
    if (opts.Icon) {
      return opts.Icon;
    }
    let iconName: string;
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
  return (
    <AlertWrapper color={color} as={Paper} elevation={4}>
      <AlertIconWrapper color={color}>{AlertIcon}</AlertIconWrapper>
      <AlertCopyWrapper>
        <Typography>{opts.message}</Typography>
        <Typography>{opts.secondaryMessage}</Typography>
      </AlertCopyWrapper>
      <AlertActionsWrapper>
        <ButtonBase className='close-btn'>Dismiss</ButtonBase>
      </AlertActionsWrapper>
    </AlertWrapper>
  );
};
export const Notification: React.FC<NotificationProps> = ({}) => {
  useEffect(() => () => {}, []);
  return (
    <Alert>
      This is a success message!
      <Button>close</Button>
    </Alert>
  );
};
