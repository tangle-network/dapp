import { Button, Checkbox, FormControlLabel, IconButton, InputBase, Tooltip } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Currency } from '@webb-dapp/api-providers';
import { WalletConfig } from '@webb-dapp/api-providers/types';
import { TokenBalance } from '@webb-dapp/mixer/components';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { FC, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { useCrowdloan } from './hooks/useCrowdloan';

export const AmountInputWrapper = styled.div`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 1px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  height: 50px;
  border-radius: 10px;
  padding: 5px;
  align-items: center;
  justify-content: space-between;
`;

export const AmountButton = styled.button``;

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
  const { amount, execute, setAmount } = useCrowdloan();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();
  const [displayedAmount, setDisplayedAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

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
        setTokenBalance(Number(balance));
      });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  return (
    <div>
      <ContentWrapper>
        <ContributeWrapper wallet={activeWallet}>
          <div className='titles-and-information'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6'>
                <b>BALANCE</b>
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
            <AmountInputWrapper>
              <div style={{ width: '100%' }}>
                <InputBase
                  placeholder={`Enter Amount`}
                  fullWidth
                  value={displayedAmount}
                  inputProps={{ style: { fontSize: 14, paddingLeft: '15px' } }}
                  onChange={(event) => {
                    setDisplayedAmount(event.target.value);
                    let maybeNumber = Number(event.target.value);
                    if (!Number.isNaN(maybeNumber)) {
                      setAmount(Number(event.target.value));
                    } else {
                      setAmount(0);
                    }
                  }}
                />
              </div>
              <div>
                <AmountButton
                  color={'primary'}
                  as={Button}
                  onClick={() => {
                    setDisplayedAmount(tokenBalance.toString());
                    setAmount(tokenBalance);
                  }}
                >
                  MAX
                </AmountButton>
              </div>
            </AmountInputWrapper>
            <SpaceBox height={16} />

            <MixerButton
              disabled={loading || !amount}
              label={'contribute'}
              onClick={async () => {
                try {
                  setLoading(true);
                  await execute();
                } finally {
                  setLoading(false);
                }
              }}
            />
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
