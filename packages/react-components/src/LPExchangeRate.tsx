import React, { FC, useState, useCallback } from 'react';

import { CurrencyId } from '@webb-tools/types/interfaces';

import { FormatBalance } from '@webb-dapp/react-components';
import { SwapOutlined, Tag } from '@webb-dapp/ui-components';
import { useLPExchangeRate, useApi } from '@webb-dapp/react-hooks';

import classes from './LPExchangeRate.module.scss';
import { getCurrenciesFromDexShare } from './utils';

interface Props {
  lp: CurrencyId;
}

export const LPExchangeRate: FC<Props> = ({ lp }) => {
  const { api } = useApi();
  const [isForward, setIsForward] = useState<boolean>(true);

  const currencies = getCurrenciesFromDexShare(api, lp);
  const [supply, target] = currencies.sort((item) => (item.asToken.toString() === 'AUSD' ? 1 : -1));
  const supply2Target = useLPExchangeRate(target, supply);
  const target2Supply = useLPExchangeRate(supply, target);

  const handleSwapDirection = useCallback(() => {
    setIsForward(!isForward);
  }, [isForward, setIsForward]);

  return (
    <div className={classes.root}>
      <FormatBalance
        pair={
          isForward
            ? [
                {
                  balance: 1,
                  currency: supply,
                },
                {
                  balance: supply2Target,
                  currency: target,
                },
              ]
            : [
                {
                  balance: 1,
                  currency: target,
                },
                {
                  balance: target2Supply,
                  currency: supply,
                },
              ]
        }
        pairSymbol='≈'
      />
      <Tag className={classes.swap} onClick={handleSwapDirection}>
        <SwapOutlined />
      </Tag>
    </div>
  );
};
