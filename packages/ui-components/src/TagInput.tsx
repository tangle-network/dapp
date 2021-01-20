import React, { FC } from 'react';
import clsx from 'clsx';

import { NumberInputProps, NumberInput } from './NumberInput';
import classes from './TagInput.module.scss';

interface Props extends NumberInputProps{
  label: string;
  error?: boolean;
}

export const TagInput: FC<Props> = ({
  className,
  error,
  label,
  ...inputProps
}) => {
  return (
    <div
      className={
        clsx(
          className,
          classes.root,
          {
            [classes.error]: error
          }
        )
      }
    >
      <NumberInput {...inputProps}
        className={classes.input} />
      {label ? <span>{label}</span> : null}
    </div>
  );
};
