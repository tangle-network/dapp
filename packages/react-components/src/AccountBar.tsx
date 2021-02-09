import { useAccounts, useConstants } from '@webb-dapp/react-hooks';
import { styled } from '@webb-dapp/ui-components';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useState } from 'react';

import Identicon from '@polkadot/react-identicon';

import { FormatAddress } from './format';
import { TokenSelector } from './TokenSelector';

const AccountBarRoot = styled.div`
  display: flex;
  height: 36px;
  background: var(--card-background);

  border-radius: 10px;
`;

const Account = styled.div<{ active: boolean }>`
  margin: 1px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: calc(100% - 2px);
  border-radius: 10px;
  box-shadow: ${({ active }): string => (active ? '0 0 2px 2px rgba(23, 61, 201, 0.1)' : 'none')};
  transition: box-shadow 0.2s ease-in-out;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: var(--text-color-primary);
  font-weight: var(--text-weight-light);
  white-space: nowrap;

  &:hover {
    box-shadow: 0 0 2px 2px rgba(23, 61, 201, 0.1);
  }
`;

const AccountIcon = styled(Identicon)`
  margin-left: 18px;
  width: 16px;
  height: 16px;
  pointer-events: none;

  &.container::before {
    box-shadow: none;
  }
`;

const CTokenSelector = styled(TokenSelector)`
  padding: 0 0 0 12px;
`;

const Asserts: FC = () => {
  const { allCurrencies } = useConstants();
  const [active, setActive] = useState<CurrencyId>(allCurrencies[0]);
  // const valueRender = useCallback((value: CurrencyId) => {
  //   return <CUserAssetBalance currency={value} showCurrency />;
  // }, []);

  return (
    <CTokenSelector
      checkBalance={false}
      currencies={allCurrencies}
      onChange={setActive}
      value={active}
      // valueRender={valueRender}
    />
  );
};

export const AccountBar: FC = () => {
  const { active, openSelectAccount, selectAccountStatus } = useAccounts();

  return (
    <AccountBarRoot>
      <Asserts />
      <Account active={selectAccountStatus} onClick={openSelectAccount}>
        <FormatAddress address={active?.name || active?.address || ''} />
        <AccountIcon size={16} theme='polkadot' value={active?.address || ''} />
      </Account>
    </AccountBarRoot>
  );
};
