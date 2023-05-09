import React, { useMemo } from 'react';
import { useDynamicSVGImport } from './hooks/useDynamicSVGImport';
import { Spinner } from './Spinner';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

// If the chain name contains `tangle`, then it is a tangle chain
const TANGLE_CHAIN = 'tangle';

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

  const name = useMemo(() => {
    const chainName = nameProp?.toLowerCase() || '';
    if (chainName.includes(TANGLE_CHAIN)) {
      return TANGLE_CHAIN;
    }

    return chainName.replace(/\s/g, '-');
  }, [nameProp]);

  const { SvgIcon, error, loading } = useDynamicSVGImport(name, {
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
