import React, { FC, ReactNode } from 'react';

import { ArrowRightOutlined, styled } from '@webb-dapp/ui-components';
import { BalanceInputValue, FormatBalance, getCurrencyIdFromName, TokenImage } from '@webb-dapp/react-components';
import { useApi } from '@webb-dapp/react-hooks';
import { TradeParameters } from '@acala-network/sdk-swap/trade-parameters';
import { InfoItem, InfoItemLabel, InfoItemValue, InfoRoot } from '../common';

interface SwapRouteProps {
  parameters: TradeParameters;
}

const SwapRouteRoot = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.1875;

  .swap-route__content {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  .swap-route__token-image {
    width: 16px;
    height: 16px;
  }

  .swap-route__arrow {
    margin: 4px;
  }
`;

const SwapRoute: FC<SwapRouteProps> = ({ parameters }) => {
  const { api } = useApi();

  return (
    <SwapRouteRoot>
      Swap Route is
      <div className='swap-route__content'>
        {parameters.path.map((item, index): ReactNode[] => {
          return [
            <TokenImage
              className='swap-route__token-image'
              currency={getCurrencyIdFromName(api, item.name)}
              key={`${item.toString()}`}
            />,
            index < parameters.path.length - 1 ? (
              <ArrowRightOutlined className='swap-route__arrow' key={`${item.toString()}-arrow`} />
            ) : null
          ];
        })}
      </div>
    </SwapRouteRoot>
  );
};

// const SwapFee: FC = () => {
//   const { api } = useApi();

//   return (
//     <div className={classes.info}>
//       Transaction Fee is <FormatRatio data={FixedPointNumber.fromInner(api.consts.dex.getExchangeFee.toString())} />
//     </div>
//   );
// };

interface Props {
  output: Partial<BalanceInputValue>;
  parameters: TradeParameters;
}

export const SwapInfo: FC<Props> = ({ output, parameters }) => {
  if (!parameters) return null;

  return (
    <InfoRoot>
      <InfoItem>
        <InfoItemLabel>Minimum received</InfoItemLabel>
        <InfoItemValue>
          <FormatBalance balance={parameters.output.amount} currency={output.token} />
        </InfoItemValue>
      </InfoItem>
      {parameters.path.length > 2 ? (
        <InfoItem>
          <InfoItemLabel>Route</InfoItemLabel>
          <InfoItemValue>
            <SwapRoute parameters={parameters} />
          </InfoItemValue>
        </InfoItem>
      ) : null}
    </InfoRoot>
  );
};
