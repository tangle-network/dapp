import React, { FC, memo } from 'react';

import { useApi } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';

import classes from './ApiStatus.module.scss';
import clsx from 'clsx';

export const ApiStatus: FC<BareProps> = memo(({ className }) => {
  const { connected, error, loading } = useApi();

  return (
    <div
      className={clsx(className, classes.root, {
        [classes.connected]: connected,
        [classes.error]: error,
        [classes.loading]: loading
      })}
    >
      <p>{loading ? 'Connecting' : 'Connected'}</p>
    </div>
  );
});

ApiStatus.displayName = 'ApiStatus';
