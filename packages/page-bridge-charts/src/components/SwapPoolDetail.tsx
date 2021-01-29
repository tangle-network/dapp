import React, { FC, useMemo } from 'react';

import { Table } from 'antd';
import { Card } from '@webb-dapp/ui-components';
import { useSwapOverview } from '@webb-dapp/react-hooks';
import { Token, FormatBalance, FormatValue } from '@webb-dapp/react-components';

export const SwapPoolDetail: FC = () => {
  const overview = useSwapOverview();

  const columns = useMemo(() => {
    return [
      {
        key: 'currency',
        /* eslint-disable-next-line react/display-name */
        render: (item: any): JSX.Element => <Token currency={item.currency} />,
        title: 'Currency',
      },
      {
        key: 'pool_detail',
        /* eslint-disable-next-line react/display-name */
        render: (item: any): JSX.Element => (
          <FormatBalance
            pair={[
              {
                balance: item.token1Amount,
                currency: item.token1,
              },
              {
                balance: item.token2Amount,
                currency: item.token2,
              },
            ]}
            pairSymbol='+'
          />
        ),
        title: 'Token Pair',
      },
      {
        key: 'value',
        /* eslint-disable-next-line react/display-name */
        render: (item: any): JSX.Element => <FormatValue data={item.value} />,
        title: 'Value',
      },
    ];
  }, []);

  if (!overview) return null;

  return (
    <Card header='Swap Pool Details' padding={false}>
      <Table columns={columns} dataSource={overview.details} pagination={false} />
    </Card>
  );
};
