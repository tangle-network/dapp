import clsx from 'clsx';
import React, { FC } from 'react';
import styled from 'styled-components';

import { NumberInput, NumberInputProps } from './NumberInput';
import classes from './TagInput.module.scss';

interface Props extends NumberInputProps {
  label: string;
  error?: boolean;
}
const TagInputRoot = styled.div<any>`
  &,
  .aca-number-input {
    color: var(--card-background) !important;
  }
`;

export const TagInput: FC<Props> = ({ className, error, label, ...inputProps }) => {
  return (
    <TagInputRoot
      className={clsx(className, classes.root, {
        [classes.error]: error,
      })}
    >
      <NumberInput {...inputProps} className={classes.input} />
      {label ? <span>{label}</span> : null}
    </TagInputRoot>
  );
};
