import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Button, Checkbox, FormControlLabel, IconButton, InputBase, InputProps, Tooltip } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import { TokenInput, TokenInputProps } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { BridgeCurrency, useWebContext } from '@webb-dapp/react-environment';
import { useIp } from '@webb-dapp/react-hooks/useIP';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { WebbCurrencyId } from '@webb-dapp/apps/configs';
import { fromBridgeCurrencyToCurrencyView } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import Typography from '@material-ui/core/Typography';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { MixerGroupSelect } from '@webb-dapp/ui-components/Inputs/MixerGroupSelect/MixerGroupSelect';
import { useWrapUnwrap } from '@webb-dapp/page-wrap-unwrap/hooks/useWrapUnwrap';

const TransferWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
`;
const AmountInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const AmountButton = styled.button`
  && {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate3d(0, -50%, 0);
  }
`;

const TabsWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
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

const PageWrappUnwrap: FC = () => {
  const { leftHandToken, rightHandToken, swap, setLeftHandToken, setRightHandToken, wrappedTokens, tokens } =
    useWrapUnwrap();

  const [isSwap, setIsSwap] = useState(false);
  const [status, setStatus] = useState<'wrap' | 'unwrap'>('wrap');

  const { activeApi } = useWebContext();
  const ip = useIp(activeApi);

  const [useFixedDeposits, setUseFixedDepoists] = useState(true);

  const bridgeTokenInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: tokens,
      value: leftHandToken,
      onChange: (currencyContent) => {
        setLeftHandToken(currencyContent);
      },
    };
  }, [tokens, leftHandToken]);

  const wrappedTokenInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: wrappedTokens,
      value: rightHandToken,
      onChange: (currencyContent) => {
        setRightHandToken(currencyContent);
      },
    };
  }, [rightHandToken, status, wrappedTokens]);
  const leftInputProps = status === 'unwrap' ? bridgeTokenInputProps : wrappedTokenInputProps;
  const rightInputProps = status === 'wrap' ? bridgeTokenInputProps : wrappedTokenInputProps;
  const buttonText = 'wrap';

  const suffix = leftHandToken?.view.symbol;

  const dummySizes = useMemo(() => {
    return [
      {
        id: `${status} 1 ${suffix}`,
        title: `1 ${suffix}`,
      },
      {
        id: `${status} 10 ${suffix}`,
        title: `10 ${suffix}`,
      },
      {
        id: `${status} 100 ${suffix}`,
        title: `100 ${suffix}`,
      },
      {
        id: `${status} 1000 ${suffix}`,
        title: `1000 ${suffix}`,
      },
    ];
  }, [status, suffix]);

  const [activeSize, setAcitveSize] = useState<any | null>(null);

  const switchToWrap = useCallback(() => {
    setStatus('wrap');
  }, []);
  const switchToUnwrap = useCallback(() => {
    setStatus('unwrap');
  }, []);

  return (
    <div>
      <TransferWrapper>
        <TabHeader>
          <TabButton onClick={switchToWrap} active={status === 'wrap'}>
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
          <TabButton onClick={switchToUnwrap} active={status === 'unwrap'}>
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

        <InputSection>
          <InputLabel label={'Transfer Token'} />
          <SpaceBox height={5} />
          <Flex
            row
            ai={'center'}
            flex={1}
            style={{
              position: 'relative',
            }}
          >
            <Flex flex={2}>
              <TokenInput wrapperStyles={{ top: -25 }} {...leftInputProps} />
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
                      setStatus((s) => (s === 'wrap' ? 'unwrap' : 'wrap'));
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
        </InputSection>

        <SpaceBox height={16} />

        {useFixedDeposits ? (
          <MixerGroupSelect
            items={dummySizes}
            value={activeSize}
            onChange={(i) => {
              setAcitveSize(i);
            }}
          />
        ) : (
          <InputSection>
            <InputLabel label={`${status} amount`} />
            <AmountInputWrapper>
              <InputBase fullWidth placeholder={'Enter amount'} />
              <AmountButton color={'primary'} as={Button}>
                MAX
              </AmountButton>
            </AmountInputWrapper>
          </InputSection>
        )}
        <FormControlLabel
          value={useFixedDeposits}
          checked={useFixedDeposits}
          onChange={() => {
            setUseFixedDepoists((t) => !t);
          }}
          control={<Checkbox color={'primary'} />}
          label={<Typography color={'textPrimary'}>Use Fixed depoists</Typography>}
        />
        <SpaceBox height={16} />

        <MixerButton label={buttonText} onClick={() => {}} />
      </TransferWrapper>

      <SpaceBox height={8} />

      <IPDisplay ip={ip.ip} />
    </div>
  );
};

export default PageWrappUnwrap;
