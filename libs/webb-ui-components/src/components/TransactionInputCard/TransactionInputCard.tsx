'use client';

import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import {
  ChainIcon,
  ChevronDown,
  ShieldKeyholeFillIcon,
  ShieldKeyholeLineIcon,
  WalletFillIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';
import { getRoundedAmountString, toFixed } from '../../utils';
import { AdjustAmount } from '../BridgeInputs';
import { Switcher } from '../Switcher';
import { Tooltip, TooltipTrigger, TooltipBody } from '../Tooltip';
import { TextField } from '../TextField';
import { TitleWithInfo } from '../TitleWithInfo';
import TokenSelector from '../TokenSelector';
import {
  TransactionButtonProps,
  TransactionChainSelectorProps,
  TransactionInputCardBodyProps,
  TransactionInputCardContextValue,
  TransactionInputCardFooterProps,
  TransactionInputCardHeaderProps,
  TransactionInputCardRootProps,
  TransactionMaxAmountButtonProps,
} from './types';

const TransactionInputCardContext =
  createContext<TransactionInputCardContextValue>({});

const TransactionInputCardRoot = forwardRef<
  React.ElementRef<'div'>,
  TransactionInputCardRootProps
>(
  (
    {
      accountType,
      amount,
      children,
      className,
      isFixedAmount,
      maxAmount,
      onAmountChange,
      onIsFixedAmountChange,
      tokenSymbol,
      typedChainId,
      errorMessage,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        className={twMerge(
          'w-full rounded-lg px-3 py-1.5 space-y-2 border',
          errorMessage
            ? 'border-red-70 dark:border-red-50'
            : 'border-mono-40 dark:border-mono-160',
          'bg-mono-20 dark:bg-mono-180',
          'hover:bg-[#E2E5EB]/30 dark:hover:bg-mono-170',
          className,
        )}
      >
        <TransactionInputCardContext.Provider
          value={{
            accountType,
            amount,
            isFixedAmount,
            maxAmount,
            onAmountChange,
            onIsFixedAmountChange,
            tokenSymbol,
            typedChainId,
            errorMessage,
          }}
        >
          {children}
        </TransactionInputCardContext.Provider>
      </div>
    );
  },
);
TransactionInputCardRoot.displayName = 'TransactionInputCardRoot';

const TransactionChainSelector = forwardRef<
  React.ElementRef<'button'>,
  TransactionChainSelectorProps
>(
  (
    {
      typedChainId: typedChainIdProps,
      className,
      disabled,
      placeholder = 'Select Chain',
      renderBody,
      ...props
    },
    ref,
  ) => {
    const context = useContext(TransactionInputCardContext);

    const typedChainId = typedChainIdProps ?? context.typedChainId;
    const chain = typedChainId ? chainsConfig[typedChainId] : undefined;

    return (
      <button
        type="button"
        {...props}
        disabled={disabled}
        ref={ref}
        className={twMerge('flex items-center gap-1 p-2 group', className)}
      >
        {typeof renderBody === 'function' ? (
          renderBody()
        ) : (
          <p className="flex items-center gap-2">
            {chain && <ChainIcon name={chain.name} size="lg" />}

            <Typography
              variant="h5"
              fw="bold"
              component="span"
              className="inline-block text-mono-200 dark:text-mono-40"
            >
              {chain?.name ?? placeholder}
            </Typography>
          </p>
        )}

        {!disabled && (
          <ChevronDown
            size="lg"
            className="rounded-lg group-hover:bg-mono-40 dark:group-hover:bg-mono-160"
          />
        )}
      </button>
    );
  },
);
TransactionChainSelector.displayName = 'TransactionChainSelector';

const TransactionButton = forwardRef<
  React.ElementRef<'button'>,
  TransactionButtonProps
>(({ className, children, Icon, ...props }, ref) => {
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        'group flex items-center gap-1',
        'text-mono-170 dark:text-mono-80',
        'hover:enabled:text-mono-190 dark:hover:enabled:text-mono-20',
        'disabled:text-mono-100 dark:disabled:text-mono-100',
        className,
      )}
      ref={ref}
    >
      {Icon &&
        cloneElement(Icon, {
          ...Icon.props,
          className: twMerge('!fill-current', Icon.props.className),
        })}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Typography
          variant="body1"
          fw="bold"
          className="!text-inherit group-hover:group-enabled:underline"
        >
          {children}
        </Typography>
      ) : (
        children
      )}
    </button>
  );
});
TransactionButton.displayName = 'TransactionButton';

const TransactionMaxAmountButton = forwardRef<
  React.ElementRef<'button'>,
  TransactionMaxAmountButtonProps
>(
  (
    {
      className,
      tokenSymbol: tokenSymbolProp,
      maxAmount: maxAmountProp,
      accountType: accountTypeProp,
      onAmountChange: onAmountChangeProp,
      disabled: disabledProp,
      tooltipBody,
      Icon,
      ...props
    },
    ref,
  ) => {
    const context = useContext(TransactionInputCardContext);

    const tokenSymbol = tokenSymbolProp ?? context.tokenSymbol;
    const accountType = accountTypeProp ?? context.accountType;
    const maxAmount = maxAmountProp ?? context.maxAmount;
    const onAmountChange = onAmountChangeProp ?? context.onAmountChange;

    const buttonCnt = useMemo(() => {
      const amount =
        typeof maxAmount === 'number' ? toFixed(maxAmount, 5) : '--';
      const fmtAmount =
        typeof amount === 'number' ? getRoundedAmountString(amount, 5) : amount;
      const tokenSym = tokenSymbol ?? '';

      return `${fmtAmount} ${tokenSym}`.trim();
    }, [maxAmount, tokenSymbol]);

    const disabled = useMemo(
      () => disabledProp ?? (typeof maxAmount !== 'number' || maxAmount <= 0),
      [disabledProp, maxAmount],
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <TransactionButton
            {...props}
            ref={ref}
            disabled={disabled}
            onClick={
              typeof maxAmount === 'number'
                ? () => onAmountChange?.(`${toFixed(maxAmount, 5)}`)
                : undefined
            }
            Icon={
              Icon === undefined ? (
                accountType === 'note' ? (
                  <>
                    <ShieldKeyholeLineIcon className="!fill-current group-hover:group-enabled:hidden group-disabled:hidden" />
                    <ShieldKeyholeFillIcon className="!fill-current hidden group-hover:group-enabled:block group-disabled:block" />
                  </>
                ) : (
                  <>
                    <WalletLineIcon className="!fill-current group-hover:group-enabled:hidden group-disabled:hidden" />
                    <WalletFillIcon className="!fill-current hidden group-hover:group-enabled:block group-disabled:block" />
                  </>
                )
              ) : (
                Icon
              )
            }
            className={disabled ? 'cursor-not-allowed' : ''}
          >
            {buttonCnt}
          </TransactionButton>
        </TooltipTrigger>
        <TooltipBody>
          {tooltipBody === undefined
            ? accountType === 'note'
              ? 'Shielded Balance'
              : 'Wallet Balance'
            : tooltipBody}
        </TooltipBody>
      </Tooltip>
    );
  },
);
TransactionMaxAmountButton.displayName = 'TransactionMaxAmountButton';

const TransactionInputCardHeader = forwardRef<
  React.ElementRef<'div'>,
  TransactionInputCardHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge(
        'py-1 flex items-center justify-between',
        'border-b border-mono-40 dark:border-mono-160',
        className,
      )}
    >
      {children}
    </div>
  );
});
TransactionInputCardHeader.displayName = 'TransactionInputCardHeader';

const TransactionInputCardBody = forwardRef<
  React.ElementRef<'div'>,
  TransactionInputCardBodyProps
>(
  (
    {
      amount: amountProp,
      className,
      customAmountProps,
      fixedAmountProps,
      isFixedAmount: isFixedAmountProp,
      onAmountChange: onAmountChangeProp,
      tokenSelectorProps,
      tokenSymbol: tokenSymbolProp,
      ...props
    },
    ref,
  ) => {
    const context = useContext(TransactionInputCardContext);

    const amount = amountProp ?? context.amount;
    const isFixedAmount = isFixedAmountProp ?? context.isFixedAmount;
    const tokenSymbol = tokenSymbolProp ?? context.tokenSymbol;
    const onAmountChange = onAmountChangeProp ?? context.onAmountChange;

    const handleTextFieldChange = useMemo(() => {
      if (!onAmountChange) {
        return undefined;
      }

      return (e: React.ChangeEvent<HTMLInputElement>) => {
        onAmountChange(e.target.value);
      };
    }, [onAmountChange]);

    return (
      <div
        {...props}
        ref={ref}
        className={twMerge(
          'flex items-center justify-between gap-2',
          className,
        )}
      >
        {isFixedAmount ? (
          <AdjustAmount
            min={0}
            {...fixedAmountProps}
            className={twMerge(
              'max-w-[var(--adjust-amount-width)] h-full grow',
              fixedAmountProps?.className,
            )}
            value={typeof amount === 'string' ? Number(amount) : undefined}
            onChange={
              typeof onAmountChange === 'function'
                ? (nextVal) => onAmountChange(`${nextVal}`)
                : undefined
            }
          />
        ) : (
          <TextField.Root isDisabledHoverStyle className="!bg-transparent grow">
            <TextField.Input
              placeholder="0.0"
              min={0}
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={amount}
              onChange={handleTextFieldChange}
              {...customAmountProps}
            />
          </TextField.Root>
        )}

        <TokenSelector
          type="button"
          {...tokenSelectorProps}
          className={twMerge('max-w-[210px]', tokenSelectorProps?.className)}
        >
          {tokenSymbol}
        </TokenSelector>
      </div>
    );
  },
);
TransactionInputCardBody.displayName = 'TransactionInputCardBody';

const TransactionInputCardFooter = forwardRef<
  React.ElementRef<'div'>,
  TransactionInputCardFooterProps
>(
  (
    {
      className,
      labelWithTooltipProps,
      isFixedAmount: isFixedAmountProp,
      onIsFixedAmountChange: onIsFixedAmountChangeProp,
      ...props
    },
    ref,
  ) => {
    const context = useContext(TransactionInputCardContext);

    const isFixedAmount = isFixedAmountProp ?? context.isFixedAmount;
    const onIsFixedAmountChange =
      onIsFixedAmountChangeProp ?? context.onIsFixedAmountChange;

    return (
      <div
        {...props}
        ref={ref}
        className={twMerge('py-1 flex gap-2 items-center', className)}
      >
        <TitleWithInfo
          {...labelWithTooltipProps}
          title="Fixed amount"
          className="text-mono-100 dark:text-mono-100"
        />

        <Switcher
          checked={isFixedAmount}
          onCheckedChange={onIsFixedAmountChange}
        />
      </div>
    );
  },
);
TransactionInputCardFooter.displayName = 'TransactionInputCardFooter';

const TransactionInputCard = Object.assign(
  {},
  {
    Root: TransactionInputCardRoot,
    Header: TransactionInputCardHeader,
    Body: TransactionInputCardBody,
    Footer: TransactionInputCardFooter,
    ChainSelector: TransactionChainSelector,
    Button: TransactionButton,
    MaxAmountButton: TransactionMaxAmountButton,
  },
);

export {
  TransactionButton,
  TransactionChainSelector,
  TransactionInputCard,
  TransactionInputCardBody,
  TransactionInputCardFooter,
  TransactionInputCardHeader,
  TransactionInputCardRoot,
  TransactionMaxAmountButton,
};
