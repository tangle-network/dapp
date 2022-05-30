import { Typography } from '@material-ui/core';
import { Currency } from '@webb-dapp/api-providers';
import { WalletConfig } from '@webb-dapp/api-providers/types';
import { currenciesConfig } from '@webb-dapp/apps/configs';
import { TokenBalance } from '@webb-dapp/mixer/components';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import React, { FC, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const ContributeWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) {
      return css``;
    } else {
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
    }
  }}
`;

const PageCrowdloan: FC = () => {
  const { activeApi, activeChain, activeWallet } = useWebContext();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();
  const [tokenBalance, setTokenBalance] = useState('');

  const allCurrencies = useMemo(() => {
    return activeChain
      ? activeChain.currencies.map((currencyId) => {
          return Currency.fromCurrencyId(currenciesConfig, currencyId);
        })
      : [];
  }, [activeChain, currenciesConfig]);
  const activeToken = useMemo(() => allCurrencies[0], [allCurrencies]);

  // Side effect for getting the balance of the token
  useEffect(() => {
    if (!activeToken || !activeChain || !activeApi) {
      return;
    }

    activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(activeChain.id, activeToken.view.id as any)
      .then((balance) => {
        setTokenBalance(balance);
      });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  return (
    <div>
      <ContentWrapper>
        <ContributeWrapper wallet={activeWallet}>
          <div className='titles-and-information'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                <b>AMOUNT</b>
              </Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Typography
                  variant='body2'
                  style={{ color: palette.type === 'dark' ? palette.accentColor : palette.primaryText }}
                >
                  Your Balance~
                </Typography>
              </div>
              <TokenBalance>
                <Typography variant='body2'>
                  {getRoundedAmountString(Number(tokenBalance))} {activeToken?.view.symbol}
                </Typography>
              </TokenBalance>
            </div>
          </div>
        </ContributeWrapper>
      </ContentWrapper>
    </div>
  );
};

export default pageWithFeatures({
  features: [],
  message: 'The crowdloan module is not supported on this chain.',
})(PageCrowdloan);
