import { alpha, ButtonBase, Checkbox, InputBase, Typography } from '@material-ui/core';
import { Currency } from '@webb-dapp/api-providers';
import { WalletConfig } from '@webb-dapp/api-providers/types';
import { TokenBalance } from '@webb-dapp/mixer/components';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components/Box';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { FC, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { useCrowdloan } from './hooks/useCrowdloan';
import { CrowdloanInfo } from './CrowdloanInfo';

export const PageCrowdloanWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin: 0px auto;

  ${above.md`
    flex-direction: row; 
    align-items: flex-start;
  `}
`;

export const AmountInputWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 1px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  height: 50px;
  border-radius: 10px;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  && {
    cursor: ${({ disabled }) => (disabled ? 'no-drop' : 'auto')};
  }
`;

export const AmountButton = styled.button`
  padding: 0 4px;

  && {
    transition: none;
    color: ${({ theme }) => alpha(theme.accentColor, 0.8)};

    :hover {
      color: ${({ theme }) => theme.accentColor};
    }
  }
`;

const ContributeWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  box-sizing: border-box;
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  width: 90%;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
  `}

  ${above.sm`
    width: 60%;
  `}

  ${above.md`
    width: 49%;
  `}

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

  .checkbox-label {
    padding: 8px;
    padding-left: 0;

    ${above.xs`
      padding: 8px 32px;
      padding-left: 0;
    `}
  }
`;

const InfoWrapper = styled.div`
  box-sizing: border-box;
  margin-top: 20px;
  width: 90%;

  ${above.sm`
    width: 60%;
  `}

  ${above.md`
    margin-top: 0px; 
    width: 49%;
  `}
`;

type TitleInfoProps = { label: string; value?: string; style?: React.CSSProperties };

const TitleInfo: React.FC<TitleInfoProps> = ({ label, style, value = '-' }) => {
  return (
    <div style={style}>
      <Typography variant='caption'>{label}</Typography>
      <Typography variant='h5' component='p'>
        {value}
      </Typography>
    </div>
  );
};

export type PageCrowdloanProps = {};

const PageCrowdloan: FC<PageCrowdloanProps> = () => {
  const { activeApi, activeChain, activeWallet } = useWebContext();
  const { amount, contribute, fundInfo, getFundInfo, setAmount } = useCrowdloan();
  const palette = useColorPallet();
  const { currencies: currenciesConfig } = useAppConfig();

  const [displayedAmount, setDisplayedAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const allCurrencies = useMemo(() => {
    return activeChain
      ? activeChain.currencies.map((currencyId) => {
          return Currency.fromCurrencyId(currenciesConfig, currencyId);
        })
      : [];
  }, [activeChain, currenciesConfig]);

  const activeToken = useMemo(() => allCurrencies[0], [allCurrencies]);
  const isFundingEnded = useMemo(() => BigInt(blockNumber) > fundInfo.end, [blockNumber, fundInfo]);
  const confirmText = useMemo(
    () =>
      "Your KSM will be contributed to the crowdloan for Webb's Kusama parachain slot lease and locked for the duration of the lease. If this crowdloan does not win an auction slot, your KSM will be returned.",
    []
  );

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
    <PageCrowdloanWrapper>
      <ContributeWrapper wallet={activeWallet}>
        <div className='titles-and-information'>
          {fundInfo && (
            <Flex row jc='space-between' ai='center' style={{ marginBottom: '16px' }}>
              <Flex style={{ minWidth: '47%' }} jc='center'>
                <TitleInfo label='RAISED' value={fundInfo?.raised.toString()} style={{ marginBottom: '4px' }} />
                <TitleInfo label='CURRENT BLOCK' value={blockNumber.toString()} />
              </Flex>
              <Flex style={{ minWidth: '47%' }}>
                <TitleInfo label='CAP' value={fundInfo?.cap.toString()} style={{ marginBottom: '4px' }} />
                <TitleInfo label='END BLOCK' value={fundInfo?.end.toString()} />
              </Flex>
            </Flex>
          )}

          <Flex row jc='flex-end' style={{ marginBottom: '8px' }}>
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
          </Flex>

          <AmountInputWrapper disabled={isFundingEnded}>
            <InputBase
              disabled={isFundingEnded}
              placeholder={`Enter Amount`}
              fullWidth
              value={displayedAmount}
              inputProps={{ style: { fontSize: 14, cursor: isFundingEnded ? 'no-drop' : 'auto' } }}
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
            <AmountButton
              disabled={isFundingEnded}
              as={ButtonBase}
              onClick={() => {
                setDisplayedAmount(tokenBalance.toString());
                setAmount(new FixedPointNumber(tokenBalance, activeToken.getDecimals()));
              }}
            >
              MAX
            </AmountButton>
          </AmountInputWrapper>

          <Flex row ai='flex-start' style={{ marginLeft: '-9px', opacity: isFundingEnded ? 0.4 : 1 }}>
            <Checkbox
              disabled={isFundingEnded}
              size='medium'
              checked={isConfirmed}
              onChange={() => setIsConfirmed((p) => !p)}
              inputProps={{ 'aria-label': 'controlled' }}
              style={{ color: palette.accentColor, display: 'block' }}
            />
            <Typography display='block' variant='caption' className='checkbox-label'>
              {confirmText}
            </Typography>
          </Flex>

          <SpaceBox height={16} />

          <MixerButton
            disabled={loading || !amount || !!error || isFundingEnded || !isConfirmed}
            label={error ? 'Amount exceeds cap' : isFundingEnded ? 'Funding ended' : 'Contribute'}
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
      <InfoWrapper>
        <CrowdloanInfo />
      </InfoWrapper>
    </PageCrowdloanWrapper>
  );
};

export default pageWithFeatures({
  features: [],
  message: 'The crowdloan module is not supported on this chain.',
})(PageCrowdloan);
