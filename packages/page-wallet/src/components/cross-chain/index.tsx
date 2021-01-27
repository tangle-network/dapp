import React, { FC, ReactElement } from 'react';
import { noop } from 'lodash';

import { CurrencyId } from '@webb-tools/types/interfaces';
import { TokenImage, TokenName, TokenFullName } from '@webb-dapp/react-components';
import { useConstants } from '@webb-dapp/react-hooks';
import { styled, Tabs, useTabs } from '@webb-dapp/ui-components';

import { RenBtc } from './RenBtc';
import { AUSD } from './AUSD';
import { DOT } from './DOT';

const CrossChainTabRoot = styled.div<{ active: boolean; disabled: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr;

  width: 216px;
  height: 64px;

  margin-right: 24px;

  border: 1px solid #ebeef5;
  box-shadow: var(--card-shadow);
  border-radius: 12px;
  background: #ffffff;
  transition: all 200ms ease;
  cursor: ${({ disabled }): string => (disabled ? 'not-allowed' : 'pointer')};
  filter: ${({ disabled }): string => (disabled ? 'grayscale(100%) opacity(0.5)' : 'none')};
  border-color: ${({ active }): string => (active ? 'var(--color-primary)' : '')};
`;

const AssetImage = styled.div`
  display: grid;
  place-items: center;
  border-right: 1px solid var(--tab-border);

  > img {
    width: 42px;
    height: 42px;
  }
`;

const AssetName = styled.div`
  padding: 8px 16px;

  & > span:nth-child(1) {
    display: block;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
    color: var(--text-color-primary);
  }

  & > span:nth-child(2) {
    display: block;
    font-size: 14px;
    line-height: 21px;
    color: var(--text-color-second);
  }
`;

interface AssetCardProps {
  active: boolean;
  currency: CurrencyId;
  disabled: boolean;
  onClick: () => void;
}

const AssetCard: FC<AssetCardProps> = ({ active, currency, disabled, onClick }) => {
  return (
    <CrossChainTabRoot active={active} disabled={disabled} onClick={disabled ? noop : onClick}>
      <AssetImage>
        <TokenImage currency={currency} />
      </AssetImage>
      <AssetName>
        <TokenName currency={currency} />
        <TokenFullName currency={currency} />
      </AssetName>
    </CrossChainTabRoot>
  );
};

type CrossChainType = 'RENBTC' | 'AUSD' | 'DOT';

const crossChainConsoleList: Map<CrossChainType, ReactElement> = new Map([
  ['RENBTC', <RenBtc key='renbtc' />],
  ['AUSD', <AUSD key='ausd' />],
  ['DOT', <DOT key='dot' />]
]);

const crossChainEnable: Map<CrossChainType, boolean> = new Map([
  ['RENBTC', true],
  ['AUSD', false],
  ['DOT', false]
]);

export const CrossChainConsole: FC = () => {
  const { crossChainCurrencies } = useConstants();
  const { changeTabs, currentTab } = useTabs<CrossChainType>('RENBTC');

  return (
    <Tabs<CrossChainType> active={currentTab} divider={false} onChange={changeTabs}>
      {crossChainCurrencies.map((currency) => {
        const disabled = !crossChainEnable.get(currency.asToken.toString() as CrossChainType);

        return (
          <Tabs.Panel
            $key={currency.asToken.toString()}
            disabled={disabled}
            header={
              <AssetCard
                active={currentTab === currency.asToken.toString()}
                currency={currency}
                disabled={disabled}
                onClick={(): void => changeTabs(currency.asToken.toString() as CrossChainType)}
              />
            }
            key={`cross-chain-${currency.asToken.toString()}`}
          >
            {crossChainConsoleList.get(currency.asToken.toString() as CrossChainType)}
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
};
