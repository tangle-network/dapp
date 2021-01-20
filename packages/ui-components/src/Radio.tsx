import React, { FC, memo, InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import classes from './Radio.module.scss';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
  label?: ReactNode;
  checked?: boolean;
  onClick?: () => void;
}

export const Radio: FC<Props> = memo(({
  checked = false,
  className,
  disabled,
  label,
  onClick,
  ...other
}) => {
  const _onClick = (): void => {
    if (disabled) {
      return;
    }

    onClick && onClick();
  };

  return (
    <div
      className={
        clsx(
          classes.root,
          className,
          {
            [classes.checked]: checked,
            [classes.disabled]: disabled
          }
        )
      }
      onClick={_onClick}
    >
      <span className={classes.radio}>
        <input
          className={classes.input}
          {...other}
        />
      </span>
      {label ? <div className={classes.label}>{label}</div> : null}
    </div>
  );
});

Radio.displayName = 'Radio';
