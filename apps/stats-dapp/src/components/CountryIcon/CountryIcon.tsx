import { TokenIconBase } from '@webb-tools/icons/types';
import { getIconSizeInPixel } from '@webb-tools/icons/utils';
import * as flags from 'country-flag-icons/react/3x2';
import {} from 'country-flag-icons';
import { FC } from 'react';

export const CountryIcon: FC<TokenIconBase & { isActive?: boolean }> = (
  props
) => {
  const {
    className,
    isActive,
    name,
    onCompleted,
    onError,
    size = 'md',
    ...restProps
  } = props;

  const C = flags[name.toUpperCase()];
  if (!C) {
    return <>!</>;
  }
  const sizeInPx = getIconSizeInPixel(size);
  return (
    <div className="relative">
      <C
        className={className}
        width={parseInt(sizeInPx)}
        height={parseInt(sizeInPx)}
        {...restProps}
      />
      <span className="inline-block absolute w-1.5 h-1.5 bg-green-50 dark:bg-green-40 rounded-full top-0 right-0" />
    </div>
  );
};
