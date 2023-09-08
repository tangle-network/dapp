import { ChainIcon } from '@webb-tools/icons';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChainChipProps } from './types';
import { getChainChipClassName } from './utils';

/**
 * `ChainChip` component
 *
 * Props:
 *
 * - `type`: `ChainType` -
 * polygon
  | ethereum
  | optimism
  | kusama
  | moonbeam
  | polkadot
  | arbitrum
  | avalanche
  | tangle
  | cosmos
  | scroll
  | webb-dev
 * - `name`: `string` -
 * Chain name to display. e.g. Ethereum, Polygon, Kusama, Optimism Goerli etc.
 * @example
 *
 * ```jsx
 *  <ChainChip type="optimism" name="optimism goerli" />
 *  <ChainChip type="moonbeam" name="moonbeam alpha" />
 * ```
 */
export const ChainChip = React.forwardRef<HTMLSpanElement, ChainChipProps>(
  (props, ref) => {
    const {
      className: classNameProp,
      chainType,
      chainName,
      title,
      ...restProps
    } = props;

    const baseClsx = useMemo(
      () =>
        'box-border inline-flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-md uppercase text-[12px] leading-[15px] font-bold text-mono-200 w-fit',
      []
    );

    const iconName = useMemo(
      () =>
        chainName.toLowerCase().includes('tangle')
          ? 'tangle transparent'
          : chainName,
      [chainName]
    );

    const className = useMemo(() => {
      const chainChipClassNames = getChainChipClassName(chainType);
      return twMerge(baseClsx, chainChipClassNames, classNameProp);
    }, [baseClsx, chainType, classNameProp]);

    // Short chain name
    const shortChainName = useMemo(() => {
      return chainName.split(' ').pop();
    }, [chainName]);

    return (
      <span className={className} {...restProps} ref={ref}>
        <ChainIcon name={iconName} size="md" />
        {title ?? shortChainName}
      </span>
    );
  }
);
