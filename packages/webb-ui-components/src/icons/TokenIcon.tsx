import React from 'react';

import { useDynamicSVGImport } from '../hooks';
import { TokenIconBase } from './types';
import { getIconSizeInPixel } from './utils';

export const TokenIcon: React.FC<TokenIconBase> = (props) => {
  const { className, name, onCompleted, onError, size = 'md', ...restProps } = props;

  const { SvgIcon, error, loading } = useDynamicSVGImport(name, { onCompleted, onError });

  if (error) {
    return <span>{error}</span>;
  }

  if (loading) {
    return <span>Loading...</span>;
  }

  if (SvgIcon) {
    const sizeInPx = getIconSizeInPixel(size);
    return <SvgIcon className={className} width={parseInt(sizeInPx)} height={parseInt(sizeInPx)} {...restProps} />;
  }

  return null;
};
