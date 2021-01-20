import React, { FC, useMemo } from 'react';

import { CurrencyId } from '@acala-network/types/interfaces';
import { FormatBalance } from '@webb-dapp/react-components';
import { useLPSize, useApi, useIssuance, usePrice } from '@webb-dapp/react-hooks';

import { getCurrenciesFromDexShare, getCurrencyIdFromName } from './utils';
import { BareProps } from '@webb-dapp/ui-components/types';
import { FixedPointNumber } from '@acala-network/sdk-core';
import { Token } from './Token';
import { FlexBox } from '@webb-dapp/ui-components';
import { FormatValue } from './format';

interface Props {
  lp: CurrencyId;
}

export const LPSize: FC<Props> = ({ lp }) => {
  const { api } = useApi();
  const [token1, token2] = getCurrenciesFromDexShare(api, lp);
  const lpSize = useLPSize(token1, token2);

  if (!lp) return null;

  return (
    <FormatBalance
      decimalLength={2}
      pair={Object.keys(lpSize).map((item) => {
        return {
          balance: lpSize[item],
          currency: getCurrencyIdFromName(api, item)
        };
      })}
      pairSymbol='/'
    />
  );
};

interface LPSizeWithShareProps extends BareProps {
  lp: CurrencyId;
  share: number;
}

export const LPSizeWithShare: FC<LPSizeWithShareProps> = ({ className, lp, share }) => {
  const { api } = useApi();
  const [token1, token2] = getCurrenciesFromDexShare(api, lp);
  const size = useLPSize(token1, token2);
  const issuance = useIssuance(lp);
  const result = useMemo(() => {
    if (!size) return [];

    const keys = Object.keys(size);
    const _share = new FixedPointNumber(share);

    return [
      getCurrencyIdFromName(api, keys[0]),
      size[keys[0]].times(_share.div(issuance)),
      getCurrencyIdFromName(api, keys[1]),
      size[keys[1]].times(_share.div(issuance))
    ] as [CurrencyId, FixedPointNumber, CurrencyId, FixedPointNumber];
  }, [api, size, issuance, share]);

  if (result.length === 0) return null;

  return (
    <FlexBox alignItems='center' className={className}>
      <FormatBalance balance={result[1]} />
      <Token currency={result[0]} padding />
      <span>+</span>
      <FormatBalance balance={result[3]} />
      <Token currency={result[2]} padding />
    </FlexBox>
  );
};

interface LPSizeWithShareProps extends BareProps {
  lp: CurrencyId;
  share: number;
}

export const LPAmountWithShare: FC<LPSizeWithShareProps> = ({ className, lp, share }) => {
  const { api } = useApi();
  const [token1, token2] = getCurrenciesFromDexShare(api, lp);
  const size = useLPSize(token1, token2);
  const price1 = usePrice(token1);
  const price2 = usePrice(token2);
  const issuance = useIssuance(lp);
  const result = useMemo(() => {
    if (!size) return FixedPointNumber.ZERO;

    const keys = Object.keys(size);
    const _share = new FixedPointNumber(share);
    const amount1 = size[keys[0]].times(_share.div(issuance)).times(price1);
    const amount2 = size[keys[1]].times(_share.div(issuance)).times(price2);

    return amount1.plus(amount2);
  }, [size, issuance, share, price1, price2]);

  return <FormatValue className={className} data={result} />;
};
