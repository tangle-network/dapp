import React from 'react';

import { useDynamicSVGImport } from '../hooks';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

export const TokenIcon: React.FC<TokenIconBase> = (props) => {
  const { className, name, onCompleted, onError, size = 'md', ...restProps } = props;

  const { SvgIcon, error, loading } = useDynamicSVGImport(name, { onCompleted, onError });

  if (error) {
    return <p>{error}</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (SvgIcon) {
    const sizeInPx = getIconSizeInPixel(size);
    return <SvgIcon className={className} width={sizeInPx} height={sizeInPx} {...restProps} />;
  }

  return null;
};
