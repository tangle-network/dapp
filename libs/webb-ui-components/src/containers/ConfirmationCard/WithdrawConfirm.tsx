import {
  ArrowRight,
  Close,
  Download,
  ExternalLinkLine,
} from '@webb-tools/icons';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Avatar,
  Button,
  ChainChip,
  ChainsRing,
  ChainType,
  CheckBox,
  Chip,
  CopyWithTooltip,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokenWithAmount,
} from '../../components';
import { Typography } from '../../typography';
import { formatTokenAmount, shortenString } from '../../utils';
import { Section, WrapperSection } from './WrapperSection';
import { WithdrawConfirmationProps } from './types';

export const WithdrawConfirm = forwardRef<
  HTMLDivElement,
  WithdrawConfirmationProps
>(
  (
    {
      actionBtnProps,
      activeChains,
      amount,
      changeAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      feesInfo,
      fungibleTokenSymbol: token1Symbol,
      isCopied,
      note,
      onClose,
      onCopy,
      onDownload,
      progress,
      receivingInfo,
      recipientAddress,
      refundAmount,
      refundToken,
      relayerAddress,
      relayerAvatarTheme,
      txStatusMessage,
      relayerExternalUrl,
      remainingAmount,
      sourceChain,
      title = 'Confirm Withdrawal',
      wrappableTokenSymbol: token2Symbol,
      ...props
    },
    ref
  ) => {
    const receivingContent = useMemo(() => {
      if (!remainingAmount) {
        return undefined;
      }

      if (refundAmount) {
        return `${remainingAmount} ${
          token2Symbol ?? token1Symbol
        } + ${refundAmount} ${refundToken ?? ''}`;
      }

      return `${remainingAmount} ${token2Symbol ?? token1Symbol}`;
    }, [
      remainingAmount,
      refundAmount,
      refundToken,
      token1Symbol,
      token2Symbol,
    ]);

    return (
      <div
        {...props}
        className={twMerge(
          'p-4 rounded-lg bg-mono-0 dark:bg-mono-180 min-w-[550px] min-h-[700px] flex flex-col justify-between',
          className
        )}
        ref={ref}
      >
        <div className="space-y-6">
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
            {/** Unwrapping\Withdrawing info */}
            <Section>
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title={'Withdrawing from'}
                    variant="utility"
                    info={'Withdrawing'}
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    type={(destChain?.type as ChainType) ?? 'webb-dev'}
                    name={destChain?.name ?? ''}
                  />

                  <TokenWithAmount
                    token1Symbol={token1Symbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>
                  <ArrowRight />
                  <div className="flex items-center space-x-2">
                    <TokenWithAmount
                      token1Symbol={token2Symbol}
                      amount={remainingAmount}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <TokenWithAmount
                    token1Symbol={token1Symbol}
                    amount={remainingAmount}
                  />
                </div>
              )}
            </div>
          </Section>

                <ArrowRight size="lg" />

                <div className="flex flex-col gap-3">
                  <TitleWithInfo
                    title={token2Symbol ? 'Unwraping to' : 'Withdrawing to'}
                    variant="utility"
                    info={token2Symbol ? 'Unwraping to' : 'Withdrawing to'}
                    titleClassName="text-mono-100 dark:text-mono-80"
                    className="text-mono-100 dark:text-mono-80"
                  />
                  <ChainChip
                    type={(destChain?.type as ChainType) ?? 'webb-dev'}
                    name={destChain?.name ?? ''}
                  />
                  <TokenWithAmount
                    token1Symbol={token2Symbol ?? token1Symbol}
                    amount={formatTokenAmount(amount?.toString() ?? '')}
                  />
                </div>
              </div>
            </Section>
          </WrapperSection>

          {/** Transaction Details */}
          <div className="space-y-2">
            <TitleWithInfo
              titleComponent="h6"
              title={`Transaction Details`}
              variant="utility"
              titleClassName="text-mono-100 dark:text-mono-80"
              className="text-mono-100 dark:text-mono-80"

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
          )}
        </WrapperSection>

        {/** Transaction Details */}
        <div className="space-y-2">
          <TitleWithInfo
            titleComponent="h6"
            title={`Transaction Details`}
            variant="utility"
            titleClassName="text-mono-100 dark:text-mono-80"
            className="text-mono-100 dark:text-mono-80"
          />
          <div className="space-y-1">
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Receiving',
                info: receivingInfo,
              }}
              rightContent={receivingContent}
            />
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Change Amount',
                info: 'Change Amount',
              }}
              rightContent={changeAmount?.toString()}
            />
            <InfoItem
              leftTextProps={{
                variant: 'body1',
                title: 'Estimated fees',
                info: feesInfo,
              }}
              rightContent={fee?.toString()}

            />
            <div className="space-y-1">
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Receiving',
                  info: receivingInfo,
                }}
                rightContent={receivingContent}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Change Amount',
                  info: 'Change Amount',
                }}
                rightContent={changeAmount?.toString()}
              />
              <InfoItem
                leftTextProps={{
                  variant: 'body1',
                  title: 'Estimated fees',
                  info: feesInfo,
                }}
                rightContent={fee?.toString()}
              />
              <div className="space-y-1">
                <InfoItem
                  leftTextProps={{
                    variant: 'body1',
                    title: 'Receiving',
                  }}
                  rightContent={amount?.toString()}
                />
                <InfoItem
                  leftTextProps={{
                    variant: 'body1',
                    title: 'Change Amount',
                    info: 'Change Amount',
                  }}
                  rightContent={changeAmount?.toString()}
                />
                <InfoItem
                  leftTextProps={{
                    variant: 'body1',
                    title: 'Fees',
                    info: 'Fees',
                  }}
                  rightContent={fee?.toString()}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button {...actionBtnProps} isFullWidth className="justify-center">
              {actionBtnProps?.children ?? 'Withdraw'}
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
      </div>
    );
  }
);
