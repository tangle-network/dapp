import clsx from 'clsx';
import React, { FC, memo } from 'react';

import classes from './FormItem.module.scss';
import { BareProps } from './types';

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
