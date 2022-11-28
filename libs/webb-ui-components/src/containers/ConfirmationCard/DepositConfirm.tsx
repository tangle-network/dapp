import { ArrowRight, Close, Download, FileCopyLine } from '@webb-tools/icons';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import {
  Button,
  ChainsRing,
  CheckBox,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokenWithAmount,
} from '../../components';
import { PropsOf } from '../../types';
import { DepositConfirmProps } from './types';

export const DepositConfirm = forwardRef<HTMLDivElement, DepositConfirmProps>(
  (
    {
      actionBtnProps,
      activeChains,
      amount,
      wrappingAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      note,
      onClose,
      onCopy,
      onDownload,
      progress = null,
      sourceChain,
      title = 'Confirm Deposit',
      governedTokenSymbol,
      wrappableTokenSymbol,
      ...props
    },
    ref
  ) => {
    const governedTokenValue = useMemo(() => {
      if (!amount) {
        return '0';
      }

      if (governedTokenSymbol) {
        return `${amount} ${governedTokenSymbol.toUpperCase()}`;
      }

      return amount.toString();
    }, [governedTokenSymbol, amount]);

    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 min-w-[550px] space-y-6',
          className
        )}
        ref={ref}
      >
        {/** Title */}
        <div className="flex items-center justify-between p-2">
          <Typography variant="h5" fw="bold">
            {title}
          </Typography>
          <button onClick={onClose}>
            <Close size="lg" />
          </button>
        </div>

        {/** Chains ring */}
        <div>
          <ChainsRing
            activeChains={activeChains}
            sourceLabel={
              sourceChain && sourceChain === destChain
                ? 'Depositing from & to'
                : 'Depositing from'
            }
            destLabel={
              destChain && sourceChain !== destChain
                ? 'Depositing to'
                : undefined
            }
            sourceChain={sourceChain}
            destChain={destChain}
            amount={amount}
            tokenPairString={`${governedTokenSymbol}${
              wrappableTokenSymbol ? `-${wrappableTokenSymbol}` : ''
            }`}
          />
        </div>

        {/** Transaction progress */}
        {typeof progress === 'number' ? <Progress value={progress} /> : null}

        {/** Wrapping info */}
        {wrappableTokenSymbol && governedTokenSymbol && (
          <WrapperCard>
            <div className="space-y-4">
              <TitleWithInfo
                titleComponent="h6"
                title="Unwrapping"
                variant="utility"
                info="Unwrapping"
                titleClassName="text-mono-100 dark:text-mono-80"
                className="text-mono-100 dark:text-mono-80"
              />
              <div className="flex items-center space-x-4">
                <TokenWithAmount
                  token1Symbol={wrappableTokenSymbol}
                  amount={wrappingAmount}
                />
                <ArrowRight />
                <TokenWithAmount
                  token1Symbol={wrappableTokenSymbol}
                  token2Symbol={governedTokenSymbol}
                  amount={amount}
                />
              </div>
            </div>
          </WrapperCard>
        )}

        {/** New spend note */}
        <WrapperCard>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TitleWithInfo
                titleComponent="h6"
                title="New Spend Note"
                info="New Spend Note"
                variant="utility"
                titleClassName="text-mono-100 dark:text-mono-80"
                className="text-mono-100 dark:text-mono-80"
              />
              <div className="flex space-x-2">
                <Button
                  variant="utility"
                  size="sm"
                  className="p-2"
                  onClick={onCopy}
                >
                  <FileCopyLine className="!fill-current" />
                </Button>
                <Button
                  variant="utility"
                  size="sm"
                  className="p-2"
                  onClick={onDownload}
                >
                  <Download className="!fill-current" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between max-w-[470px]">
              <Typography
                variant="mono1"
                fw="bold"
                className="block truncate text-mono-140 dark:text-mono-0"
              >
                {note}
              </Typography>
            </div>

            <CheckBox
              {...checkboxProps}
              wrapperClassName={twMerge(
                'flex items-center',
                checkboxProps?.wrapperClassName
              )}
            >
              {checkboxProps?.children ?? 'I have copied the spend note'}
            </CheckBox>
          </div>
        </WrapperCard>

        {/** Transaction Details */}
        <div className="px-4 space-y-2">
          <div className="space-y-1">
            <InfoItem
              leftTextProps={{
                variant: 'utility',
                title: 'Depositing',
              }}
              rightContent={governedTokenValue}
            />
            <InfoItem
              leftTextProps={{
                variant: 'utility',
                title: 'Fees',
                info: 'Fees',
              }}
              rightContent={fee?.toString()}
            />
          </div>
        </div>

        <Button {...actionBtnProps} isFullWidth className="justify-center">
          {actionBtnProps?.children ?? 'Deposit'}
        </Button>
      </div>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

const WrapperCard = forwardRef<HTMLDivElement, PropsOf<'div'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'p-2 bg-mono-20 dark:bg-mono-160 rounded-lg',
          className
        )}
        ref={ref}
      >
        <div className="px-4 py-2 rounded-lg bg-mono-0 dark:bg-mono-140">
          {children}
        </div>
      </div>
    );
  }
);
