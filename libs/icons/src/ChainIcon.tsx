import React, { cloneElement, useMemo } from 'react';
import { Spinner } from './Spinner';
import { useDynamicSVGImport } from './hooks/useDynamicSVGImport';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

export const ChainIcon: React.FC<TokenIconBase & { isActive?: boolean }> = ({
  isActive,
  ...props
}) => {
  const {
    className,
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

  const { svgElement, error, loading } = useDynamicSVGImport(name, {
    onCompleted,
    onError,
    type: 'chain',
  });

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
