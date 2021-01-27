import React, { FC, memo } from 'react';
import clsx from 'clsx';

import { BareProps } from './types';
import classes from './FormItem.module.scss';

interface Props extends BareProps {
  label: string;
}

export const FormItem: FC<Props> = memo(({ children, className, label }) => {
  return (
    <div className={clsx(classes.root, className)}>
      <p className={classes.label}>{label}</p>
      <div className={classes.content}>{children}</div>
    </div>
  );
});

FormItem.displayName = 'FormItem';
