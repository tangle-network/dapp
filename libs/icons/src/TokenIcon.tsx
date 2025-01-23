'use client';

import cx from 'classnames';
import { MouseEventHandler, cloneElement, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Spinner from './Spinner';
import { TokenIconBase } from './types';
import { useDynamicSVGImport } from './useDynamicSVGImport';
import { getIconSizeInPixel } from './utils';

type Props = TokenIconBase & {
  isActive?: boolean;
  customLoadingCmp?: React.ReactNode;
  spinnerSize?: TokenIconBase['size'];
};

export const TokenIcon: React.FC<Props> = (props) => {
  const {
    className: classNameProp,
    isActive,
    name,
    onCompleted,
    onError,
    size = 'md',
    onClick,
    customLoadingCmp,
    spinnerSize,
    ...restProps
  } = props;

  const { svgElement, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
  });

  const className = useMemo(
    () =>
      twMerge(
        cx({
          'cursor-copy': Boolean(onClick),
          [cx(
            'fill-mono-60 stroke-mono-60',
            'dark:fill-mono-140 dark:stroke-mono-140',
          )]: typeof name === 'undefined', // Style for placeholder
        }),
        classNameProp,
      ),
    [classNameProp, name, onClick],
  );

  // Prevent infinite loop when the passed onClick not use useCallback.
  const onClickRef = useRef<
    MouseEventHandler<SVGElement | HTMLDivElement> | undefined
  >(onClick);

  if (error !== undefined) {
    return <span>{error.message}</span>;
  } else if (loading) {
    return customLoadingCmp ?? <Spinner {...props} size={spinnerSize} />;
  }

  if (svgElement) {
    const sizeInPx = getIconSizeInPixel(size);

    const props: React.SVGProps<SVGElement> = {
      className,
      width: parseInt(sizeInPx),
      height: parseInt(sizeInPx),
      onClick,
      ...restProps,
    };

    return isActive ? (
      <div className="relative" onClick={onClickRef.current}>
        {cloneElement(svgElement, props)}
        <span className="inline-block absolute w-1.5 h-1.5 bg-green-50 dark:bg-green-40 rounded-full top-0 right-0" />
      </div>
    ) : (
      cloneElement(svgElement, { ...props, onClick: onClickRef.current })
    );
  }

  return null;
};
