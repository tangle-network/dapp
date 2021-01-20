import React, { FC, PropsWithChildren, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import classes from './NotificationDisplay.module.scss';
import { NotificationConfig } from './types';
import { Loading } from '../Loading';
import { ReactComponent as SuccessIcon } from '../assets/success.svg';
import { ReactComponent as ErrorIcon } from '../assets/error.svg';
import { ReactComponent as InformationIcon } from '../assets/information.svg';

const NotificationPortal: FC<PropsWithChildren<{}>> = ({ children }) => {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const $body = document.querySelector('body')!;
  const $divRef = useRef(document.createElement('div'));
  const $div = $divRef.current;

  $div.classList.add('notification--root');

  useEffect((): () => void => {
    $body.append($div);

    return (): void => { $body.removeChild($div); };
  }, [$body, $div]);

  return createPortal(children, $div);
};

const NotificationCard: FC<NotificationConfig> = (config) => {
  const renderIcon = (): ReactNode => {
    if (config.icon === 'loading') {
      return <Loading />;
    }

    if (config.icon === 'success') {
      return <SuccessIcon />;
    }

    if (config.icon === 'information') {
      return <InformationIcon />;
    }

    if (config.icon === 'error') {
      return <ErrorIcon />;
    }

    return config.icon;
  };

  return (
    <>
      <div
        className={
          clsx(
            classes.root,
            classes[config.type || 'info'],
            {
              [classes.noContent]: !config.content
            }
          )
        }
      >
        <div className={classes.icon}>{renderIcon()}</div>
        <div className={classes.content}>
          <div className={classes.title}>{config.title}</div>
          <div className={classes.info}>{config.content}</div>
        </div>
      </div>
    </>
  );
};

export const NotificationDisplay: FC<{ data: NotificationConfig[] }> = ({ data }) => {
  return (
    <NotificationPortal>
      {
        data.map((item) => (
          <NotificationCard
            key={`notification-${item.id}`}
            {...item}
          />
        ))
      }
    </NotificationPortal>
  );
};
