import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';

import { MessageType, BareProps } from './types';
import { ReactComponent as AlertIcon } from './assets/alert.svg';
import './Alert.scss';

interface AlertProps extends BareProps {
  message: ReactNode;
  type?: MessageType;
  icon?: boolean;
}

export const Alert = styled(({ className, icon = true, message, type }) => {
  return (
    <div className={clsx(type, className)}>
      {icon ? <AlertIcon className='aca-alert__icon' /> : null}
      <span className={'alert__message'}>{message}</span>
    </div>
  );
})<FC<AlertProps>>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 15px 40px;
  min-height: 58px;
  background-image: linear-gradient(270deg, #DF008E 0%, #FF4E4E 98%);
  border-radius: 12px;
  font-size: 20px;
  line-height: 24px;
  color: #ffffff;

  .aca-alert__icon {
    margin-right: 16px;
  }
`;
