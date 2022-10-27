import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronRight, TokenIcon } from '@nepoche/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';

import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { TokenInputProps } from './types';

/**
 * Token Input component, for selecting token on the bridge
 *
 * @example
 *
 * ```jsx
 *  <TokenInput />
 *  <TokenInput token={{ symbol: 'eth', balance: 1.2, balanceInUsd: 1000 }} />
 * ```
 */
export const TokenInput = forwardRef<HTMLDivElement, TokenInputProps>(
  ({ className, id, info, title = 'Token', token, ...props }, ref) => {
    const [balance, balanceInUsd] = useMemo(() => {
      let balance: string | undefined;
      let balanceInUsd: string | undefined;

      if (token?.balance) {
        balance = getRoundedAmountString(parseFloat(token.balance.toString()));
      }

      if (token?.balanceInUsd) {
        balanceInUsd = getRoundedAmountString(
          parseFloat(token.balanceInUsd.toString())
        );
      }

      return [balance, balanceInUsd];
    }, [token]);

    return (
      <InputWrapper
        {...props}
        className={twMerge(cx({ 'items-start': balance }), className)}
        ref={ref}
      >
        <div className="flex flex-col space-y-1">
          <Label htmlFor={id}>
            <TitleWithInfo
              title={title}
              variant="body4"
              info={info}
              titleComponent="span"
              className="text-mono-100 dark:text-mono-80"
              titleClassName="uppercase !text-inherit"
            />
          </Label>

          {token ? (
            <p className="flex items-center space-x-1">
              <TokenIcon name={token.symbol.trim().toLowerCase()} size="lg" />

              <Typography component="span" variant="body1" fw="bold">
                {token.symbol.trim().toUpperCase()}
              </Typography>
            </p>
          ) : (
            <Typography variant="body1" fw="bold" className="capitalize">
              Select {title}
            </Typography>
          )}
        </div>

        {balance ? (
          <div className="flex flex-col items-end space-y-1">
            <Typography
              variant="body4"
              fw="bold"
              component="span"
              className="uppercase text-mono-100 dark:text-mono-80"
            >
              Balance: {balance} {balanceInUsd ? `≈ $${balanceInUsd}` : ''}
            </Typography>

            <ChevronRight className="inline-block grow" />
          </div>
        ) : (
          <ChevronRight className="inline-block" />
        )}
      </InputWrapper>
    );
  }
);
