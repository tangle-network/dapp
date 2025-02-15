import Spinner from '@tangle-network/icons/Spinner';
import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonSpinnerProps } from './types';

const ButtonSpinner: FC<ButtonSpinnerProps> = (props) => {
  const {
    children = <Spinner size="md" darkMode={props.darkMode} />,
    className,
    hasLabel = false,
    placement = 'start',
  } = props;

  const mergedClassName = twMerge(
    'flex items-center',
    hasLabel ? 'relative' : 'absolute',
    hasLabel ? (placement === 'start' ? `mr-2` : `ml-2`) : undefined,
    className,
  );

  return <div className={mergedClassName}>{children}</div>;
};

export default ButtonSpinner;
