import { ArrowRight, Close, Download, FileCopyLine } from '@webb-tools/icons';
import { Typography } from '../../typography';
import React, { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Button,
  CheckBox,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokensRing,
  TokenWithAmount,
} from '../../components';
import { DepositConfirmProps } from './types';
import { PropsOf } from '../../types';

export const DepositConfirm = forwardRef<HTMLDivElement, DepositConfirmProps>(
  (
    {
      actionBtnProps,
      amount,
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
      token1Symbol,
      token2Symbol,
      ...props
    },
    ref
  ) => {
    const amountValue = useMemo(() => {
      if (!amount) {
        return '0';
      }

      if (token1Symbol && token2Symbol) {
        return `${amount} ${token1Symbol.toUpperCase()}/${token2Symbol.toUpperCase()}`;
      }

      if (token1Symbol) {
        return `${amount} ${token1Symbol.toUpperCase()}`;
      }

      if (token2Symbol) {
        return `${amount} ${token2Symbol.toUpperCase()}`;
      }

      return amount.toString();
    }, [token1Symbol, token2Symbol, amount]);

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

        {/** Token ring */}
        <div>
          <TokensRing
            sourceLabel="depositing from"
            destLabel="depositing to"
            sourceChain={sourceChain}
            destChain={destChain}
            amount={amount}
            tokenPairString={
              token1Symbol && token2Symbol
                ? `${token1Symbol}/${token2Symbol}`
                : token1Symbol ?? token2Symbol ?? ''
            }
          />
        </div>

        {/** Transaction progress */}
        {typeof progress === 'number' ? <Progress value={progress} /> : null}

        {/** Unwrapping info */}
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
            {token1Symbol && (
              <div className="flex items-center space-x-4">
                <TokenWithAmount token1Symbol={token1Symbol} amount={amount} />
                {token2Symbol && (
                  <>
                    <ArrowRight />
                    <TokenWithAmount
                      token1Symbol={token1Symbol}
                      token2Symbol={token2Symbol}
                      amount={amount}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </WrapperCard>

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
              rightContent={amountValue}
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
