import { ArrowRight, Close, Download } from '@webb-tools/icons';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Button,
  ChainChip,
  CheckBox,
  Chip,
  CopyWithTooltip,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokenWithAmount,
} from '../../components';
import { Typography } from '../../typography';
import { formatTokenAmount, getRoundedAmountString } from '../../utils';
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
      feeToken,
      note,
      onClose,
      isCopied,
      onCopy,
      onDownload,
      txStatusMessage,
      progress = null,
      sourceChain,
      title = 'Confirm Deposit',
      fungibleTokenSymbol,
      wrappableTokenSymbol,
      ...props
    },
    ref
  ) => {
    const depositingInfoStr = useMemo(() => {
      let symbolStr = '';
      if (wrappableTokenSymbol) {
        symbolStr += `${wrappableTokenSymbol.trim()}/`;
      }

      symbolStr += fungibleTokenSymbol;

      const formatedAmount =
        typeof amount === 'number'
          ? getRoundedAmountString(amount, 3, Math.round)
          : amount ?? '0';

      return `${formatedAmount} ${symbolStr}`;
    }, [amount, fungibleTokenSymbol, wrappableTokenSymbol]);

    const feeContent = useMemo(() => {
      if (typeof fee === 'number' || typeof fee === 'string') {
        const formatedFee =
          typeof fee === 'number'
            ? getRoundedAmountString(fee, 3, Math.round)
            : fee;
        return `${formatedFee} ${feeToken ?? ''}`;
      }

      return '--';
    }, [fee, feeToken]);

    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 min-w-[550px] min-h-[710px] flex flex-col justify-between gap-9',
          className
        )}
        ref={ref}
      >
        <div className="space-y-4">
          {/** Title */}
          <div className="flex items-center justify-between p-2">
            <Typography variant="h5" fw="bold">
              {title}
            </Typography>
            <button onClick={onClose}>
              <Close size="lg" />
            </button>
          </div>

          {/** Transaction progress */}
          {typeof progress === 'number' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <TitleWithInfo
                  title="Status:"
                  variant="utility"
                  titleClassName="text-mono-200 dark:text-mono-0"
                />
                <Chip color="blue">{txStatusMessage}</Chip>
              </div>
              <Progress value={progress} />
            </div>
          ) : null}

          <WrapperSection>
            {/** Wrapping info */}
            <Section>
              <div className="flex items-end justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title="Source Chain"
                    variant="utility"
                    info="Source Chain"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    chainName={sourceChain?.name ?? ''}
                    chainType={sourceChain?.type ?? 'webb-dev'}
                  />
                  <TokenWithAmount
                    token1Symbol={wrappableTokenSymbol ?? fungibleTokenSymbol}
                    amount={formatTokenAmount(
                      wrappingAmount ? wrappingAmount : amount?.toString() ?? ''
                    )}
                  />
                </div>

                <ArrowRight size="lg" />

                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title="Destination Chain"
                    variant="utility"
                    info="Destination Chain"
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    chainType={destChain?.type ?? 'webb-dev'}
                    chainName={destChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={fungibleTokenSymbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>
              </div>
            </Section>

            {/** New spend note */}
            <Section>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <TitleWithInfo
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
                    variant="h5"
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
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button {...actionBtnProps} isFullWidth className="justify-center">
            {actionBtnProps?.children ?? 'Deposit'}
          </Button>

          {!progress && (
            <Button
              variant="secondary"
              isFullWidth
              className="justify-center"
              onClick={onClose}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    );
  }
);
