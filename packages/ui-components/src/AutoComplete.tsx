import './AutoComplete.scss';

import { AutoComplete as AntAutoComplete } from 'antd';
import { AutoCompleteProps as AntAutoCompleteProps } from 'antd/lib/auto-complete';
import React, { FC } from 'react';

import { ArrowIcon } from './Icon';
import { Input } from './Input';

interface AutoCompleteProps extends AntAutoCompleteProps {
  inputClassName?: string;
}

export const AutoComplete: FC<AutoCompleteProps> = (props: AutoCompleteProps) => {
  const { children, inputClassName, ...other } = props;

  return (
    <AntAutoComplete className='aca-autocomplete' {...other}>
      {children || <Input className={inputClassName} suffix={<ArrowIcon />} />}
    </AntAutoComplete>
  );
};
