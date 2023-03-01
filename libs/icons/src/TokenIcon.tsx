import cx from 'classnames';
import React, { useMemo } from 'react';

import { Spinner } from './Spinner';
import { useDynamicSVGImport } from './hooks/useDynamicSVGImport';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';
import { twMerge } from 'tailwind-merge';

export const TokenIcon: React.FC<TokenIconBase & { isActive?: boolean }> = (
  props
) => {
  const {
    className: classNameProp,
    isActive,
    name,
    onCompleted,
    onError,
    size = 'md',
    onClick,
    ...restProps
  } = props;

  const { SvgIcon, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
  });

  const className = useMemo(
    () => twMerge(cx({ 'cursor-copy': Boolean(onClick) }), classNameProp),
    [classNameProp]
  );

  if (error) {
    return <span>{error.message}</span>;
  }

  if (loading) {
    return <Spinner {...props} />;
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
