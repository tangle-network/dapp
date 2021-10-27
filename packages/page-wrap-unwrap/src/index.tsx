import React, { FC, useEffect, useMemo, useState } from 'react';
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

const PageWrappUnwrap: FC = () => {
  const [isSwap, setIsSwap] = useState(false);
  const [status, setStatus] = useState<'wrap' | 'unwrap'>('wrap');

  const { activeApi } = useWebContext();
  const ip = useIp(activeApi);
  const bridge = useBridge();

  const [bridgeCurrency, setBridgeCurrency] = useState<BridgeCurrency | null>(null);
  const [wrappedCurrency, setWrappedCurrency] = useState<Currency | null>(null);
  const [useFixedDeposits, setUseFixedDepoists] = useState(true);
  const bridgeTokens = useMemo(() => {
    return bridge.getTokens().filter((currency) => currency.currencyId !== WebbCurrencyId.WEBB);
  }, [bridge]);

  const tokens = useMemo(() => {
    return status === 'unwrap'
      ? bridgeTokens.map(fromBridgeCurrencyToCurrencyView)
      : bridgeTokens
          .filter((t) => (wrappedCurrency ? t.currencyId === wrappedCurrency.view.id : true))
          .map(fromBridgeCurrencyToCurrencyView);
  }, [bridgeTokens, status, wrappedCurrency]);

  const wrappedTokens = useMemo(() => {
    const birdgetokensFilterd =
      status == 'wrap' ? bridgeTokens : bridgeTokens.filter((i) => i.name === bridgeCurrency.name);
    return birdgetokensFilterd
      .reduce<CurrencyId[]>((a, i) => (a.includes(i.currencyId) ? a : [...a, i.currencyId]), [])
      .map((currencyId) => Currency.fromCurrencyId(currencyId));
  }, [bridgeTokens, bridgeCurrency, status]);

  const selectedBridgeCurrency = useMemo(() => {
    if (!bridgeCurrency) {
      return undefined;
    }
    return fromBridgeCurrencyToCurrencyView(bridgeCurrency);
  }, [bridgeCurrency]);
  useEffect(() => {
    if (!bridgeCurrency) {
      return;
    }
    setWrappedCurrency(Currency.fromCurrencyId(bridgeCurrency?.currencyId));
  }, [bridgeCurrency]);

  const bridgeTokenInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: tokens,
      value: selectedBridgeCurrency,
      onChange: (currencyContent) => {
        if (currencyContent) {
          setBridgeCurrency(BridgeCurrency.fromString(String(currencyContent.view.id)));
        }
      },
    };
  }, [tokens, selectedBridgeCurrency, status]);

  const wrappedTokenInputProps: TokenInputProps = useMemo(() => {
    return {
      currencies: wrappedTokens,
      value: wrappedCurrency,
      onChange: (currencyContent) => {
        if (currencyContent) {
          if (status === 'wrap') {
            const currencyId = Number(currencyContent?.view.id);
            setWrappedCurrency(Currency.fromCurrencyId(currencyId));
            if (bridgeCurrency?.currencyId !== currencyId) {
              setBridgeCurrency(null);
            }
          }
        }
      },
    };
  }, [wrappedTokens, wrappedCurrency, status, bridgeCurrency]);
  const leftInputProps = status === 'unwrap' ? bridgeTokenInputProps : wrappedTokenInputProps;
  const rightInputProps = status === 'wrap' ? bridgeTokenInputProps : wrappedTokenInputProps;
  const buttonText =
    bridgeCurrency && wrappedCurrency
      ? status === 'unwrap'
        ? `Unwrap ${bridgeCurrency?.name} to ${wrappedCurrency.view.name}`
        : `Wrap ${wrappedCurrency.view.name} into ${bridgeCurrency.name}`
      : status;
  const suffix = status === 'wrap' ? selectedBridgeCurrency?.view.symbol : wrappedCurrency?.view.symbol;

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
  return (
    <div>
      <TransferWrapper>
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
