import clsx from 'clsx';
import React, { FC } from 'react';

import classes from './Status.module.scss';

interface Props {
  success?: boolean;
}

export const Status: FC<Props> = ({ success }) => {
  return (
    <span
      className={clsx(classes.root, {
        [classes.error]: !success,
        [classes.success]: success,
      })}
    >
      {success ? 'success' : 'failed'}
    </span>
  );
};
