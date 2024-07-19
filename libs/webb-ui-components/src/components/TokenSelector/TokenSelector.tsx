import isPrimitive from '@webb-tools/dapp-types/utils/isPrimitive';
import { ChevronDown, ShieldedAssetIcon, TokenIcon } from '@webb-tools/icons';
import { getFlexBasic } from '@webb-tools/icons/utils';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { TokenSelectorProps } from './types';

/**
 * The TokenSelector component
 *
 * Props:
 * - children: the token symbol to display and render token icon
 * - className: the className to override styling
 * - isDisabled: whether the selector is disabled
 * - isActive: whether the selector is active
 * - tokenType: the token type to display (unshielded or shielded default: unshielded)
 *
 * @example
 * ```jsx
 *  <TokenSelector />
 *  <TokenSelector isDisabled />
 *  <TokenSelector>WETH</TokenSelector>
 * ```
 */
const TokenSelector = forwardRef<HTMLButtonElement, TokenSelectorProps>(
  (
    {
      children,
      className,
      isDisabled,
      isActive,
      Icon,
      tokenType = 'unshielded',
      placeholder = 'Select token',
      isDropdown = true,
      ...props
    },
    ref,
  ) => {
    const mergedClsx = useMemo(
      () =>
        twMerge(
          cx(
            'group px-2 md:px-4 py-2 rounded-lg',
            'flex items-center gap-2 max-w-fit',
            'bg-[#E2E5EB]/30 dark:bg-mono-160',
            'border border-transparent',
            'enabled:hover:border-mono-60',
            'dark:enabled:hover:border-mono-140',
            'disabled:bg-[#E2E5EB]/20 dark:disabled:bg-[#3A3E53]/70',
          ),
          className,
        ),
      [className],
    );

    const disabled = useMemo(
      () => isActive || isDisabled,
      [isDisabled, isActive],
    );

    return (
      <button {...props} disabled={disabled} className={mergedClsx} ref={ref}>
        {tokenType === 'shielded' ? (
          <ShieldedAssetIcon
            displayPlaceholder={typeof children === 'undefined'}
            size="lg"
            className={twMerge('shrink-0 grow-0', getFlexBasic('lg'))}
          />
        ) : typeof children === 'string' ? (
          <TokenIcon
            name={children.toLowerCase()}
            size="lg"
            className={twMerge('shrink-0 grow-0', getFlexBasic('lg'))}
          />
        ) : Icon ? (
          Icon
        ) : null}

        {isPrimitive(children) ? (
          <Typography
            variant="h5"
            fw="bold"
            component="span"
            className="block truncate text-mono-200 dark:text-mono-40"
          >
            {children || placeholder}
          </Typography>
        ) : (
          children || placeholder
        )}

        {isDropdown && (
          <ChevronDown
            size="lg"
            className={twMerge(
              'group-disabled:hidden',
              'fill-mono-120 dark:fill-mono-100',
              'shrink-0 grow-0',
              getFlexBasic('lg'),
            )}
          />
        )}
      </button>
    );
  },
);

export default TokenSelector;
