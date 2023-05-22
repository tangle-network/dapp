import cx from 'classnames';
import React, { cloneElement, useMemo } from 'react';

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

  const { svgElement, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
  });

  const className = useMemo(
    () => twMerge(cx({ 'cursor-copy': Boolean(onClick) }), classNameProp),
    [classNameProp]
  );

  // Prevent infinite loop when the passed onClick not use useCallback
  const onClickRef = React.useRef(onClick);

  if (error) {
    return <span>{error.message}</span>;
  }

  if (loading) {
    return <Spinner {...props} />;
  }

  if (svgElement) {
    const sizeInPx = getIconSizeInPixel(size);
    const props: React.SVGProps<SVGSVGElement> = {
      className,
      width: parseInt(sizeInPx),
      height: parseInt(sizeInPx),
      onClick,
      ...restProps,
    };

    return isActive ? (
      <div className="relative">
        {cloneElement(svgElement, props)}
        <span className="inline-block absolute w-1.5 h-1.5 bg-green-50 dark:bg-green-40 rounded-full top-0 right-0" />
      </div>
    ) : (
      cloneElement(svgElement, props)
    );
  }

  return null;
};
