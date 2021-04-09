import { styled } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import { Fixed18 } from '@webb-tools/app-util';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import clsx from 'clsx';
import React, { FC, ReactNode, useCallback, useMemo } from 'react';

import { Balance as BalanceType } from '@polkadot/types/interfaces';

import { formatBalance } from '../utils';
import classes from './format.module.scss';
import { FormatNumber, FormatNumberProps, FormatterColor } from './FormatNumber';

export interface BalancePair {
  balance?: BalanceType | Fixed18 | FixedPointNumber | number;
  currency?: CurrencyId | string;
}

export interface FormatBalanceProps extends BareProps {
  balance?: BalanceType | Fixed18 | FixedPointNumber | number;
  currency?: CurrencyId | string;
  pair?: BalancePair[];
  pairSymbol?: string;
  decimalLength?: number;
  color?: FormatterColor;
  negativeToZero?: boolean;
}

const CTokenName = styled.span`
  margin-left: 4px;
`;

const formatBalanceConfig: FormatNumberProps['formatNumberConfig'] = {
  decimalLength: 6,
  removeEmptyDecimalParts: true,
  removeTailZero: true,
};

export const FormatBalance: FC<FormatBalanceProps> = ({
  balance,
  className,
  color,
  currency,
  decimalLength = 6,
  negativeToZero = true,
  pair,
  pairSymbol,
}) => {
  const pairLength = useMemo(() => (pair ? pair.length : 0), [pair]);

  const renderBalance = useCallback(
    (data: BalancePair, index: number): ReactNode => {
      const balance = formatBalance(data?.balance);

      let displayNumber = isFinite(balance) ? balance : 0;

      if (negativeToZero) {
        displayNumber = displayNumber < 0 ? 0 : displayNumber;
      }

      return [
        <span key={'format-balance-' + index}>
          <FormatNumber data={displayNumber} formatNumberConfig={{ ...formatBalanceConfig, decimalLength }} />
          {data.currency ? ( // @ts-ignore
            <CTokenName currency={data.currency} />
          ) : null}
        </span>,
        pairSymbol && index !== pairLength - 1 ? (
          <span key={'format-balance-symbol-' + index}> {pairSymbol} </span>
        ) : null,
      ];
    },
    [decimalLength, pairSymbol, pairLength, negativeToZero]
  );

  return (
    <span className={clsx(classes.balance, className, color)}>
      {pair ? pair.map((data, index) => renderBalance(data, index)) : renderBalance({ balance, currency }, -1)}
    </span>
  );
};
