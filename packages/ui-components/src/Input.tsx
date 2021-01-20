import React, { InputHTMLAttributes, FC, ReactNode, useState, FocusEventHandler, useCallback, forwardRef } from 'react';
import clsx from 'clsx';

import classes from './Input.module.scss';
import { Condition } from './Condition';
import { Button } from './Button';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  border?: boolean;
  inputClassName?: string;
  error?: string | string[] | any;
  size?: 'small' | 'large' | 'normal';
  suffix?: ReactNode;
  prefix?: ReactNode;
  showMaxBtn?: boolean;
  onMax?: () => void;
}

export const Input: FC<InputProps> = forwardRef<HTMLDivElement, InputProps>(({
  border = true,
  className,
  error,
  inputClassName,
  onMax,
  prefix,
  showMaxBtn = false,
  size = 'normal',
  suffix,
  ...other
}, ref) => {
  const [focused, setFocused] = useState<boolean>(false);

  const onFocus: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    setFocused(true);

    if (other.onFocus) other.onFocus(event);
  }, [setFocused, other]);

  const onBlur: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    setFocused(false);

    if (other.onBlur) other.onBlur(event);
  }, [setFocused, other]);

  return (
    <div
      className={
        clsx(
          classes.root,
          className,
          classes[size],
          {
            [classes.border]: border,
            [classes.focused]: focused,
            [classes.error]: error
          }
        )
      }
      onBlur={onBlur}
      onFocus={onFocus}
      ref={ref}
    >
      <Condition condition={!!prefix}>
        <span className={classes.prefix}>{prefix}</span>
      </Condition>
      <input
        className={clsx(classes.input, inputClassName)}
        {...other}
      />
      <Condition condition={showMaxBtn}>
        <Button
          className={classes.maxBtn}
          onClick={onMax}
          type='ghost'
        >
          MAX
        </Button>
      </Condition>
      <Condition condition={!!suffix}>
        <span className={classes.suffix}>{suffix}</span>
      </Condition>
      <p className={clsx(classes.error, { [classes.show]: !!error })}>{error ? error.toString() : ''}</p>
    </div>
  );
});

Input.displayName = 'Input';
