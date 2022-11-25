import {
  ArrowRight,
  Close,
  Download,
  ExternalLinkLine,
  FileCopyLine,
} from '@webb-tools/icons';
import { Typography } from '../../typography';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  Avatar,
  Button,
  CheckBox,
  InfoItem,
  Progress,
  TitleWithInfo,
  TokensRing,
  TokenWithAmount,
} from '../../components';
import { WithdrawConfirmationProps } from './types';
import { Section, WrapperSection } from './WrapperSection';

export const WithdrawConfirm = forwardRef<
  HTMLDivElement,
  WithdrawConfirmationProps
>(
  (
    {
      actionBtnProps,
      amount,
      changeAmount,
      checkboxProps,
      className,
      destChain,
      fee,
      note,
      onClose,
      onCopy,
      onDownload,
      progress,
      relayerAddress,
      relayerExternalUrl,
      relayerAvatarTheme,
      sourceChain,
      title = 'Confirm Withdrawal',
      governedTokenSymbol: token1Symbol,
      wrappableTokenSymbol: token2Symbol,
      recipientAddress,
      ...props
    },
    ref
  ) => {
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
            destLabel="Withdrawing to"
            destChain={destChain}
            amount={amount}
            tokenPairString={
              token1Symbol && token2Symbol
                ? `${token1Symbol}/${token2Symbol}`
                : token1Symbol
            }
          />
        </div>

        {/** Transaction progress */}
        {progress && <Progress value={progress} />}

        <WrapperSection>
          {/** Unwrapping\Withdrawing info */}
          <Section>
            <div className="space-y-1">
              <TitleWithInfo
                titleComponent="h6"
                title={
                  token1Symbol && token2Symbol ? 'Unwrapping' : 'Withdrawing'
                }
                variant="utility"
                info={
                  token1Symbol && token2Symbol ? 'Unwrapping' : 'Withdrawing'
                }
                titleClassName="text-mono-100 dark:text-mono-80"
                className="text-mono-100 dark:text-mono-80"
              />
              {token1Symbol && token2Symbol ? (
                <div className="flex items-center space-x-4">
                  <TokenWithAmount
                    token1Symbol={token1Symbol}
                    amount={amount}
                  />
                  <ArrowRight />
                  <TokenWithAmount
                    token1Symbol={token2Symbol}
                    amount={amount}
                  />
                </div>
              ) : (
                <TokenWithAmount token1Symbol={token1Symbol} amount={amount} />
              )}
            </div>
          </Section>

          {/** Relayer */}
          {relayerAddress && (
            <Section>
              <div className="space-y-1">
                <TitleWithInfo
                  titleComponent="h6"
                  title="Relayer"
                  info="Relayer"
                  variant="utility"
                  titleClassName="text-mono-100 dark:text-mono-80"
                  className="text-mono-100 dark:text-mono-80"
                />

                <div className="flex items-center space-x-1">
                  <Avatar theme={relayerAvatarTheme} value={relayerAddress} />

                  <Typography variant="body1" fw="bold">
                    {relayerAddress}
                  </Typography>

                  <a
                    target="_blank"
                    href={relayerExternalUrl}
                    rel="noreferrer noopener"
                  >
                    <ExternalLinkLine />
                  </a>
                </div>
              </div>
            </Section>
          )}

          {/** Unshielded address */}
          {recipientAddress && (
            <Section>
              <div className="space-y-1">
                <TitleWithInfo
                  titleComponent="h6"
                  title="Unshielded address"
                  variant="utility"
                  titleClassName="text-mono-100 dark:text-mono-80"
                  className="text-mono-100 dark:text-mono-80"
                />
                <Typography variant="body1" fw="bold">
                  {recipientAddress}
                </Typography>
              </div>
            </Section>
          )}
        </WrapperSection>

        {/** The change note */}
        {note && (
          <WrapperSection>
            <Section>
              <div className="space-y-2">
                <TitleWithInfo
                  titleComponent="h6"
                  title="The change note"
                  info="The change note"
                  variant="utility"
                  titleClassName="text-mono-100 dark:text-mono-80"
                  className="text-mono-100 dark:text-mono-80"
                />
                <div className="flex items-center justify-between">
                  <div className="px-4 py-1.5 bg-mono-20 dark:bg-mono-160 rounded-lg grow max-w-[438px] truncate">
                    <Typography
                      variant="mono1"
                      fw="bold"
                      className="text-mono-140 dark:text-mono-0"
                    >
                      {note}
                    </Typography>
                  </div>
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
        )}

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

        <Button {...actionBtnProps} isFullWidth className="justify-center">
          {actionBtnProps?.children ?? 'Transfer'}
        </Button>
      </div>
    );
  }
);
