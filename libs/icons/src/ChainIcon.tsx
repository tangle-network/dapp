import React, { useMemo } from 'react';

import { useDynamicSVGImport } from './hooks/useDynamicSVGImport';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

export const ChainIcon: React.FC<TokenIconBase & { isActive?: boolean }> = (
  props
) => {
  const {
    className,
    isActive,
    name: nameProp,
    onCompleted,
    onError,
    size = 'md',
    ...restProps
  } = props;

  const name = useMemo(
    () => nameProp.toLowerCase().replaceAll(' ', '-'),
    [nameProp]
  );

  const { SvgIcon, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
    type: 'chain',
  });

  if (error) {
    return <span>{error.message}</span>;
  }

  if (loading) {
    return <span>Loading...</span>;
  }

  if (SvgIcon) {
    const sizeInPx = getIconSizeInPixel(size);
    return isActive ? (
      <div className="relative">
        <SvgIcon
          className={className}
          width={parseInt(sizeInPx)}
          height={parseInt(sizeInPx)}
          {...restProps}
        />
        <span className="inline-block absolute w-1.5 h-1.5 bg-green-50 dark:bg-green-40 rounded-full top-0 right-0" />
      </div>
    ) : (
      <SvgIcon
        className={className}
        width={parseInt(sizeInPx)}
        height={parseInt(sizeInPx)}
        {...restProps}
      />
    );
  }

  return null;
};
