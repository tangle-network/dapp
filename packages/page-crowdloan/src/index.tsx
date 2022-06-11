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
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { FC, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { BN } from '@polkadot/util';

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
  const { amount, contribute, fundInfo, getFundInfo, setAmount } = useCrowdloan();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();
  const [displayedAmount, setDisplayedAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const allCurrencies = useMemo(() => {
    return activeChain
      ? activeChain.currencies.map((currencyId) => {
          return Currency.fromCurrencyId(currenciesConfig, currencyId);
        })
      : [];
  }, [activeChain, currenciesConfig]);
  const activeToken = useMemo(() => allCurrencies[0], [allCurrencies]);

  // Get balance of token
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

  // Get current block
  useEffect(() => {
    if (!activeChain || !activeApi) {
      return;
    }

    activeApi.methods.chainQuery.currentBlock().then((blockNumber) => {
      setBlockNumber(blockNumber);
    });
  }, [activeApi, activeApi?.accounts.activeOrDefault, activeChain, activeToken]);

  useEffect(() => {
    if (fundInfo.cap > BigInt(0)) {
      return;
    }

    getFundInfo();
  }, [fundInfo, getFundInfo]);
  return (
    <div>
      <ContentWrapper>
        <ContributeWrapper wallet={activeWallet}>
          <div className='titles-and-information'>
            {fundInfo && (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='h6'>
                    <b>RAISED: </b>
                    {fundInfo?.raised.toString()}
                  </Typography>
                  <SpaceBox height={16} />
                  <Typography variant='h6'>
                    <b>CAP: </b>
                    {fundInfo?.cap.toString()}
                  </Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant='h6'>
                    <b>CURRENT BLOCK: </b>
                    {blockNumber}
                  </Typography>
                  <SpaceBox height={16} />
                  <Typography variant='h6'>
                    <b>END BLOCK: </b>
                    {fundInfo?.end.toString()}
                  </Typography>
                </div>
              </>
            )}
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
                  disabled={BigInt(blockNumber) > fundInfo.end}
                  placeholder={`Enter Amount`}
                  fullWidth
                  value={displayedAmount}
                  inputProps={{ style: { fontSize: 14, paddingLeft: '15px' } }}
                  onChange={(event) => {
                    setDisplayedAmount(event.target.value);
                    let maybeNumber = Number(event.target.value);
                    if (!Number.isNaN(maybeNumber)) {
                      let fixed = new FixedPointNumber(event.target.value, activeToken.getDecimals());
                      let cap = FixedPointNumber.fromInner(fundInfo.cap.toString(), activeToken.getDecimals());
                      let raised = FixedPointNumber.fromInner(fundInfo.raised.toString(), activeToken.getDecimals());
                      if (fixed.isLessThan(new FixedPointNumber(0.1, activeToken.getDecimals()))) {
                        setError('Amount must be greater than 0.1');
                      } else if (cap.minus(raised).isGreaterThan(fixed)) {
                        setError('');
                        setAmount(fixed);
                      } else {
                        setError('Amount exceeds the cap');
                      }
                    } else {
                      setAmount(new FixedPointNumber(tokenBalance, activeToken.getDecimals()));
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
                    setAmount(new FixedPointNumber(tokenBalance, activeToken.getDecimals()));
                  }}
                >
                  MAX
                </AmountButton>
              </div>
            </AmountInputWrapper>
            <SpaceBox height={16} />
            <MixerButton
              disabled={loading || !amount || !!error || BigInt(blockNumber) > fundInfo.end}
              label={error ? 'Amount exceeds cap' : BigInt(blockNumber) > fundInfo.end ? 'Funding ended' : 'Contribute'}
              onClick={async () => {
                try {
                  setLoading(true);
                  await contribute();
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
