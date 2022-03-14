import { Button, Checkbox, FormControlLabel, IconButton, InputBase, Tooltip } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';
import { useWebContext } from '@webb-dapp/react-environment';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { getRoundedAmountString, SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { TokenInput, TokenInputProps } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const logger = LoggerService.get('page-wrap-unwrap');

const TransferWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
  `}
`;
const AmountInputWrapper = styled.div`
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

const AmountButton = styled.button`

`;

const TabHeader = styled.header`
  display: flex;
  align-items: center;
  background: ${({ theme }: { theme: Pallet }) => theme.tabHeader};

  justify-content: space-between;
  padding: 7px;
  border-radius: 32px;
`;
const TabButton = styled.button<{ active?: boolean }>`
  width: 48%;
  display: flex;
  height: 46px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease-in-out;
  margin: 0 2px;

  .mixer-tab-icon {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .mixer-tab-label {
    font-size: 16px;
  }

  color: ${({ active, theme }) => {
    return !active ? (theme as Pallet).primaryText : (theme as Pallet).darkGray;
  }};

  ${({ active }) => {
    return active
      ? css`
          background: #ffffff;
          box-shadow: 0px 0px 14px rgba(54, 86, 233, 0.1);
        `
      : css`
          background: transparent;
        `;
  }}
  border-radius: 32px;
`;

const TokenBalance = styled.div`
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 5px;
  margin-left: 5px;
  padding: 0 5px;
`;

const PageWrapUnwrap: FC = () => {
  const { activeApi, activeChain } = useWebContext();
  const {
    amount,
    context,
    execute,
    governedToken,
    governedTokens,
    setAmount,
    setGovernedToken,
    setWrappableToken,
    swap,
    wrappableToken,
    wrappableTokens,
  } = useWrapUnwrap();
  const palette = useColorPallet();
  const [displayedAmount, setDisplayedAmount] = useState<string | null>(null);

  const [isSwap, setIsSwap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wrappableTokenBalance, setWrappableTokenBalance] = useState(0);
  const [governedTokenBalance, setGovernedTokenBalance] = useState(0);

  const leftInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: context === 'wrap' ? wrappableTokens : governedTokens,
      value: context === 'wrap' ? wrappableToken : governedToken,
      onChange: (currencyContent) => {
        context === 'wrap' ? setWrappableToken(currencyContent) : setGovernedToken(currencyContent);
      },
    };
  }, [context, wrappableTokens, governedTokens, wrappableToken, governedToken, setWrappableToken, setGovernedToken]);
  const rightInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: context === 'wrap' ? governedTokens : wrappableTokens,
      value: context === 'wrap' ? governedToken : wrappableToken,
      onChange: (currencyContent) => {
        context === 'wrap' ? setGovernedToken(currencyContent) : setWrappableToken(currencyContent);
      },
    };
  }, [context, governedTokens, wrappableTokens, governedToken, wrappableToken, setGovernedToken, setWrappableToken]);

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

  // If the available currencies or web context change, it is possible
  // that a token was selected which is no longer available.
  // Make sure to clear these tokens.
  useEffect(() => {
    if (governedTokens.length) {
      let supportedToken = governedTokens.find((token) => {
        token.view.id;
      });
      if (!supportedToken) {
        supportedToken = governedTokens[0];
        setGovernedToken(governedTokens[0]);
      }
      activeApi?.methods.chainQuery.tokenBalanceByCurrencyId(supportedToken.view.id as any).then((balance) => {
        setGovernedTokenBalance(Number(balance));
      });
    }
    if (wrappableTokens.length) {
      let supportedToken = wrappableTokens.find((token) => {
        token.view.id;
      });
      if (!supportedToken) {
        supportedToken = wrappableTokens[0];
        setWrappableToken(wrappableTokens[0]);
      }
      activeApi?.methods.chainQuery.tokenBalanceByCurrencyId(supportedToken.view.id as any).then((balance) => {
        setWrappableTokenBalance(Number(balance));
      });
    }
  }, [activeChain, activeApi, governedTokens, wrappableTokens, setGovernedToken, setWrappableToken]);

  return (
    <div>
      <TransferWrapper>
        <TabHeader>
          <TabButton onClick={switchToWrap} active={context === 'wrap'}>
            <span className='mixer-tab-icon'>
              <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='18' cy='18' r='18' fill='#3351F2' />
                <path
                  d='M17.2929 27.1923C17.6834 27.5828 18.3166 27.5828 18.7071 27.1923L25.0711 20.8284C25.4616 20.4378 25.4616 19.8047 25.0711 19.4141C24.6805 19.0236 24.0474 19.0236 23.6569 19.4141L18 25.071L12.3431 19.4141C11.9526 19.0236 11.3195 19.0236 10.9289 19.4141C10.5384 19.8047 10.5384 20.4378 10.9289 20.8284L17.2929 27.1923ZM17 9.51465L17 26.4852L19 26.4852L19 9.51465L17 9.51465Z'
                  fill='white'
                />
              </svg>
            </span>
            <span className='mixer-tab-label'>Wrap</span>
          </TabButton>
          <TabButton onClick={switchToUnwrap} active={context === 'unwrap'}>
            <span className='mixer-tab-icon'>
              <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='18' cy='18' r='18' fill='#52B684' />
                <path
                  d='M17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289L25.0711 15.6569C25.4616 16.0474 25.4616 16.6805 25.0711 17.0711C24.6805 17.4616 24.0474 17.4616 23.6569 17.0711L18 11.4142L12.3431 17.0711C11.9526 17.4616 11.3195 17.4616 10.9289 17.0711C10.5384 16.6805 10.5384 16.0474 10.9289 15.6569L17.2929 9.29289ZM17 26L17 10L19 10L19 26L17 26Z'
                  fill='white'
                />
              </svg>
            </span>
            <span className='mixer-tab-label'>Unwrap</span>
          </TabButton>
        </TabHeader>

        <SpaceBox height={16} />

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div>
            <Typography
              variant='body2'
              style={{ color: palette.type === 'dark' ? palette.accentColor : palette.primaryText }}
            >
              Your Balance~
            </Typography>
          </div>
          <TokenBalance>
            {wrappableToken && context === "wrap" && (
              <Typography variant='body2'>
                <b>
                  {getRoundedAmountString(wrappableTokenBalance)} {wrappableToken.view.symbol}
                </b>
              </Typography>
            )}
            {governedToken && context === "unwrap" && (
              <Typography variant='body2'>
                {getRoundedAmountString(governedTokenBalance)} {governedToken.view.symbol}
              </Typography>
            )}
          </TokenBalance>
        </div>
        <SpaceBox height={16} />
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
            <AmountButton color={'primary'} as={Button} onClick={() => {
              if (context === 'wrap') {
                setDisplayedAmount(wrappableTokenBalance.toString())
                setAmount(wrappableTokenBalance)
              } else {
                setDisplayedAmount(governedTokenBalance.toString())
                setAmount(governedTokenBalance)
              }
            }}>
              MAX
            </AmountButton>
          </div>
        </AmountInputWrapper>
        <SpaceBox height={16} />

        <MixerButton
          disabled={loading || !governedToken || !wrappableToken || !amount}
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
      </TransferWrapper>
    </div>
  );
};

export default PageWrapUnwrap;
