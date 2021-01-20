import React, { FC, ReactNode, useCallback } from 'react';
import clsx from 'clsx';
import { CopyOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';

import { notification } from './notification';
import { BareProps } from './types';
import classes from './Copy.module.scss';

interface Props extends BareProps {
  text: string;
  display?: string;
  render?: () => ReactNode;
  withCopy?: boolean;
}

export const Copy: FC<Props> = ({
  className,
  display,
  render,
  text,
  withCopy = true
}) => {
  const handleCopy = useCallback((): void => {
    notification.success({
      message: display || `copy ${text} success`
    });
  }, [display, text]);

  if (withCopy) {
    return (
      <span className={clsx(classes.root, className)}>
        { render ? render() : text }
        {
          withCopy ? (
            <CopyToClipboard
              onCopy={handleCopy}
              text={text}
            >
              <CopyOutlined style={{ marginLeft: 6 }} />
            </CopyToClipboard>
          ) : null
        }
      </span>
    );
  }

  return (
    <CopyToClipboard
      onCopy={handleCopy}
      text={text}
    >
      <span className={clsx(classes.root, className)}>
        { render ? render() : text }
        { withCopy ? <CopyOutlined style={{ marginLeft: 6 }} /> : null }
      </span>
    </CopyToClipboard>
  );
};
