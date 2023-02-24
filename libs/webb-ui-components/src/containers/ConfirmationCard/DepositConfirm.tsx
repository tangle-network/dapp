import { ArrowRight, Close, Download } from '@webb-tools/icons';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import {
  Button,
  ChainsRing,
  CheckBox,
  CopyWithTooltip,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokenWithAmount,
} from '../../components';
import { PropsOf } from '../../types';
import { DepositConfirmProps } from './types';
import { Section, WrapperSection } from './WrapperSection';

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
      isCopied,
      onCopy,
      onDownload,
      progress = null,
      sourceChain,
      title = 'Confirm Deposit',
      fungibleTokenSymbol,
      wrappableTokenSymbol,
      ...props
    },
    ref
  ) => {
    const tokenPairString = useMemo(() => {
      if (wrappableTokenSymbol) {
        return `${wrappableTokenSymbol}/${fungibleTokenSymbol}`;
      }

      return fungibleTokenSymbol;
    }, [wrappableTokenSymbol, fungibleTokenSymbol]);

    const depositingInfoStr = useMemo(() => {
      let symbolStr = '';
      if (wrappableTokenSymbol) {
        symbolStr += `${wrappableTokenSymbol.trim()}/`;
      }

      symbolStr += fungibleTokenSymbol;

      return `${amount ?? '0'} ${symbolStr}`;
    }, [amount, fungibleTokenSymbol, wrappableTokenSymbol]);

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
            tokenPairString={tokenPairString}
          />
        </div>

        {/** Transaction progress */}
        {typeof progress === 'number' ? <Progress value={progress} /> : null}

        <WrapperSection>
          {/** Wrapping info */}
          <Section>
            <div className="space-y-4">
              <TitleWithInfo
                titleComponent="h6"
                title={wrappableTokenSymbol ? 'Wrapping' : 'Depositing'}
                variant="utility"
                info={wrappableTokenSymbol ? 'Wrapping' : 'Depositing'}
                titleClassName="text-mono-100 dark:text-mono-80"
                className="text-mono-100 dark:text-mono-80"
              />
              <div className="flex items-center space-x-4">
                {wrappableTokenSymbol && (
                  <>
                    <TokenWithAmount
                      token1Symbol={wrappableTokenSymbol}
                      amount={wrappingAmount}
                    />
                    <ArrowRight />
                  </>
                )}
                <TokenWithAmount
                  token1Symbol={fungibleTokenSymbol}
                  amount={amount}
                />
              </div>
            </div>
          </Section>

          {/** New spend note */}
          <Section>
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
                  <CopyWithTooltip textToCopy={note ?? ''} />
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
          </Section>
        </WrapperSection>

        {/** Transaction Details */}
        <div className="px-4 space-y-2">
          <div className="space-y-1">
            <InfoItem
              leftTextProps={{
                variant: 'utility',
                title: 'Depositing',
                info: 'Depositing',
              }}
              rightContent={depositingInfoStr}
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
