import { ChevronRight, TokenIcon } from '@webb-tools/icons';
import { TokenPairIcons } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { MouseEventHandler, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';

import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { TokenInputComponentProps } from './types';
import { ComponentProps } from 'react';
import { MouseEvent } from 'react';

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
export const TokenInput = forwardRef<HTMLDivElement, TokenInputComponentProps>(
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

    const handleTokenIconClick = useMemo(() => {
      if (token && typeof token.onTokenClick === 'function') {
        return (event: MouseEvent<SVGSVGElement>) => {
          event.stopPropagation();
          token?.onTokenClick?.(token?.symbol);
        };
      }
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
              variant="utility"
              info={info}
              titleComponent="span"
              className="text-mono-100 dark:text-mono-80"
              titleClassName="capitalize !text-inherit"
            />
          </Label>

          {token ? (
            <div className="flex items-center space-x-1">
              {token.tokenComposition ? (
                <TokenPairIcons
                  token1Symbol={token.tokenComposition[0].trim().toLowerCase()}
                  token2Symbol={token.tokenComposition[1].trim().toLowerCase()}
                />
              ) : (
                <TokenIcon
                  onClick={handleTokenIconClick}
                  name={token.symbol.trim().toLowerCase()}
                  size="lg"
                />
              )}

              {token.tokenComposition ? (
                <Typography
                  component="span"
                  variant="h5"
                  fw="bold"
                  className="capitalize"
                >
                  {token.tokenComposition[0].trim() +
                    '/' +
                    token.tokenComposition[1].trim()}
                </Typography>
              ) : (
                <Typography
                  component="span"
                  variant="h5"
                  fw="bold"
                  className="capitalize"
                >
                  {token.symbol.trim()}
                </Typography>
              )}
            </div>
          ) : (
            <Typography variant="h5" fw="bold">
              Select {title.toLowerCase()}
            </Typography>
          )}
        </div>

        {balance ? (
          <div className="flex flex-col items-end justify-between">
            <div>
              <TitleWithInfo
                title={`Balance: ${balance} ${
                  balanceInUsd ? `≈ $${balanceInUsd}` : ''
                }`}
                variant="utility"
                titleComponent="span"
                className="text-mono-100 dark:text-mono-80"
                titleClassName="capitalize !text-inherit"
              />
            </div>

            <div>
              <ChevronRight className="inline-block" />
            </div>
          </div>
        ) : (
          <ChevronRight className="inline-block" />
        )}
      </InputWrapper>
    );
  }
);
