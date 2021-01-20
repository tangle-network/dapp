import React, { FC, useMemo } from 'react';

import { usePrice } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';

import { CurrencyId } from '@acala-network/types/interfaces';

import { FormatPrice } from './format';
import { FixedPointNumber } from '@acala-network/sdk-core';

interface Props extends BareProps {
  currency: CurrencyId;
}

/**
 * @name Price
 * @description show the `currency` price
 */
export const Price: FC<Props> = ({ className, currency }) => {
  const price = usePrice(currency);

  const _price = useMemo(() => price || FixedPointNumber.ZERO, [price]);

  return <FormatPrice className={className} data={_price} />;
};
