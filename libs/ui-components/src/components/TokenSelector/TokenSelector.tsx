import isPrimitive from '@tangle-network/dapp-types/utils/isPrimitive';
import {
  ChevronDown,
  ShieldedAssetIcon,
  TokenIcon,
} from '@tangle-network/icons';
import { getFlexBasic } from '@tangle-network/icons/utils';
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
            'group px-4 py-2 rounded-full',
            'flex items-center gap-1 max-w-fit',
            'border border-mono-100 dark:border-mono-140',
            'bg-mono-40 dark:bg-mono-170',
            'enabled:hover:bg-mono-60 enabled:hover:dark:bg-mono-160',
            'disabled:bg-[#E2E5EB]/20 dark:disabled:bg-[#3A3E53]/70',
          ),
          className,
        ),
      [className],
    );

    const disabled = isActive || isDisabled;

    const icon =
      tokenType === 'shielded' ? (
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
      ) : null;

    return (
      <button {...props} disabled={disabled} className={mergedClsx} ref={ref}>
        <div className="flex items-center gap-2">
          {/** Wrap the icon in a div, otherwise strange width issues occur. */}
          {icon !== null && <div>{icon}</div>}

          {isPrimitive(children) ? (
            <Typography
              variant="h5"
              fw="bold"
              component="span"
              className="block whitespace-nowrap text-mono-200 dark:text-mono-40"
            >
              {children || placeholder}
            </Typography>
          ) : (
            children || placeholder
          )}
        </div>

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
