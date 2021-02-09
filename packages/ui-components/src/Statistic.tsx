import clsx from 'clsx';
import React, { FC, memo } from 'react';

import classes from './Statistic.module.scss';
import { BareProps } from './types';

interface Props extends BareProps {
  title: React.ReactNode;
  value: React.ReactNode;
}

export const Statistic: FC<Props> = memo(({ className, title, value, ...rest }) => {
  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <div className={classes.head}>
        <div className={classes.title}>{title}</div>
      </div>
      <div className={classes.content}>
        <div className={classes.value}>{value}</div>
      </div>
    </div>
  );
});

Statistic.displayName = 'Statistic';
