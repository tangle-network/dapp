import { Button, IconButton, InputBase, Tooltip } from '@mui/material';
import Icon from '@mui/material/Icon';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { getRoundedAmountString, SpaceBox } from '@webb-dapp/ui-components';
import { DepositIcon } from '@webb-dapp/ui-components/assets/DepositIcon';
import { WithdrawIcon } from '@webb-dapp/ui-components/assets/WithdrawIcon';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { BalanceLabel } from '@webb-dapp/ui-components/Inputs/BalanceLabel/BalanceLabel';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { TokenInput, TokenInputProps } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { TabButton, TabHeader } from '@webb-dapp/ui-components/Tabs/MixerTabs';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { FC, useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const TransferWrapper = styled.div`
  box-sizing: border-box;
  padding: 12px 14px;
  margin: auto;
  max-width: 500px;

  ${above.xs`
    padding: 25px 35px;
  `}

  ${({ theme }) => {
    return css`
      background: ${theme.layer2Background};
      border: 1px solid ${theme.borderColor};
      border-radius: 16px;
    `;
  }}
`;

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

const PageWrapUnwrap: FC = () => {
  const {
    amount,
    context,
    execute,
    governedCurrencies,
    governedCurrency,
    governedCurrencyBalance,
    setAmount,
    setGovernedCurrency,
    setWrappableCurrency,
    swap,
    wrappableCurrencies,
    wrappableCurrency,
    wrappableCurrencyBalance,
  } = useWrapUnwrap();
  const [displayedAmount, setDisplayedAmount] = useState<string>('');
  console.log({
    amount,
    context,
    execute,
    governedCurrencies,
    governedCurrency,
    governedCurrencyBalance,
    setAmount,
    setGovernedCurrency,
    setWrappableCurrency,
    swap,
    wrappableCurrencies,
    wrappableCurrency,
    wrappableCurrencyBalance,
  });
  const [isSwap, setIsSwap] = useState(false);
  const [loading, setLoading] = useState(false);

  const leftInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: context === 'wrap' ? wrappableCurrencies : governedCurrencies,
      value: context === 'wrap' ? wrappableCurrency : governedCurrency,
      onChange: (currency) => {
        context === 'wrap' ? setWrappableCurrency(currency) : setGovernedCurrency(currency);
      },
    };
  }, [
    context,
    wrappableCurrencies,
    governedCurrencies,
    wrappableCurrency,
    governedCurrency,
    setWrappableCurrency,
    setGovernedCurrency,
  ]);

  const rightInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: context === 'wrap' ? governedCurrencies : wrappableCurrencies,
      value: context === 'wrap' ? governedCurrency : wrappableCurrency,
      onChange: (currency) => {
        context === 'wrap' ? setGovernedCurrency(currency) : setWrappableCurrency(currency);
      },
    };
  }, [
    context,
    governedCurrencies,
    wrappableCurrencies,
    governedCurrency,
    wrappableCurrency,
    setGovernedCurrency,
    setWrappableCurrency,
  ]);

  const balance = useMemo(() => {
    if (wrappableCurrency && context === 'wrap') {
      return `${getRoundedAmountString(Number(wrappableCurrencyBalance))} ${wrappableCurrency.view.symbol}`;
    }

    if (governedCurrency && context === 'unwrap') {
      return `${getRoundedAmountString(Number(governedCurrencyBalance))} ${governedCurrency.view.symbol}`;
    }

    return '-';
  }, [context, governedCurrency, governedCurrencyBalance, wrappableCurrency, wrappableCurrencyBalance]);

  const buttonText = context;

  const switchToWrap = useCallback(() => {
    if (context === 'unwrap') {
      swap();
    }
  }, [context, swap]);
  const switchToUnwrap = useCallback(() => {
    if (context === 'wrap') {
      swap();
    }
  }, [context, swap]);

  return (
    <div>
      <TabHeader>
        <TabButton onClick={switchToWrap} active={context === 'wrap'}>
          <DepositIcon style={{ display: 'block', marginRight: '8px' }} />
          <span className='mixer-tab-label'>Wrap</span>
        </TabButton>
        <TabButton onClick={switchToUnwrap} active={context === 'unwrap'}>
          <WithdrawIcon style={{ display: 'block', marginRight: '8px' }} />
          <span className='mixer-tab-label'>Unwrap</span>
        </TabButton>
      </TabHeader>
      <TransferWrapper>
        <RequiredWalletSelection>
          <Flex
            row
            ai={'center'}
            flex={1}
            style={{
              position: 'relative',
            }}
          >
            <Flex flex={2}>
              <TokenInput {...leftInputProps} />
            </Flex>
            <Flex flex={1} row ai={'center'} jc={'center'}>
              <span>
                <Tooltip title={'Swap tokens'}>
                  <IconButton
                    onMouseEnter={() => {
                      setIsSwap(true);
                    }}
                    onMouseLeave={() => {
                      setIsSwap(false);
                    }}
                    onClick={() => {
                      swap();
                    }}
                  >
                    <Icon>{isSwap ? 'swap_horiz' : 'east'}</Icon>
                  </IconButton>
                </Tooltip>
              </span>
            </Flex>
            <Flex flex={2}>
              <TokenInput wrapperStyles={{ top: -25 }} {...rightInputProps} />
            </Flex>
          </Flex>
          <SpaceBox height={16} />
          <InputTitle rightLabel={<BalanceLabel value={balance} />} />
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
                    setAmount(null);
                  }
                }}
              />
            </div>
            <div>
              <AmountButton
                color={'primary'}
                as={Button}
                onClick={() => {
                  if (context === 'wrap') {
                    setDisplayedAmount(wrappableCurrencyBalance?.toString() || displayedAmount);
                    setAmount(wrappableCurrencyBalance);
                  } else {
                    setDisplayedAmount(governedCurrencyBalance?.toString() || displayedAmount);
                    setAmount(governedCurrencyBalance);
                  }
                }}
              >
                MAX
              </AmountButton>
            </div>
          </AmountInputWrapper>
          <SpaceBox height={16} />

          <MixerButton
            disabled={loading || !governedCurrency || !wrappableCurrency || !amount}
            label={buttonText}
            onClick={async () => {
              try {
                setLoading(true);
                await execute();
              } finally {
                setLoading(false);
              }
            }}
          />
        </RequiredWalletSelection>
      </TransferWrapper>
    </div>
  );
};

export default PageWrapUnwrap;
