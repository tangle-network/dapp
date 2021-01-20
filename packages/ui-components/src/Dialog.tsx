import React, { FC, ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import { Modal } from 'antd';

import { BareProps } from './types';
import { Button } from './Button';
import { CloseIcon } from './Icon';
import './Dialog.scss';

interface Props extends BareProps {
  visiable: boolean;
  title?: ReactNode;
  action?: ReactNode;
  withClose?: boolean;
  confirmText?: string | null;
  cancelText?: string | null;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const Dialog: FC<Props> = ({
  action,
  cancelText = 'Close',
  children,
  className,
  confirmText = 'Confirm',
  onCancel,
  onConfirm,
  showCancel = false,
  title,
  visiable = true,
  withClose = false
}) => {
  const _action = useMemo(() => {
    if (action === null) {
      return null;
    }

    if (action) {
      return (
        <div className='aca-dialog__actions'>{action}</div>
      );
    }

    return (
      <div className='aca-dialog__actions'>
        {showCancel ? (
          <Button
            onClick={onCancel}
            size='small'
            style='normal'
            type='border'
          >
            {cancelText}
          </Button>
        ) : null}
        {onConfirm ? (
          <Button
            onClick={onConfirm}
            size='small'
          >
            {confirmText}
          </Button>
        ) : null}
      </div>
    );
  }, [action, showCancel, cancelText, confirmText, onCancel, onConfirm]);

  return (
    <Modal
      centered
      className={clsx(className, 'aca-dialog__root')}
      closable={withClose}
      closeIcon={<CloseIcon />}
      destroyOnClose
      footer={null}
      keyboard={true}
      maskClosable={false}
      onCancel={onCancel}
      title={title}
      visible={visiable}
      width={480}
    >
      <div>{children}</div>
      {_action}
    </Modal>
  );
};
