import React, { FC, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { Button, InputBase } from '@material-ui/core';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useWebContext } from '@webb-dapp/react-environment';
import { useIp } from '@webb-dapp/react-hooks/useIP';
import { ChainId, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { fromBridgeCurrencyToCurrencyView } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/types/currency';

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
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
`;
const AmountButton = styled.button`
  && {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate3d(0, -50%, 0);
  }
`;

const PageTransfers: FC = () => {
  const [isSwap, setIsSwap] = useState(false);
  const { activeApi, activeChain, activeWallet, chains: chainsStore, switchChain } = useWebContext();

  const ip = useIp(activeApi);
  const chains = useMemo(() => {
    return Object.keys(chainsStore);
  }, [chainsStore]);

  const srcChain = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return activeChain.id;
  }, [activeChain]);
  const [destChain, setDestChain] = useState<ChainId | undefined>(undefined);
  const [recipient, setRecipient] = useState('');
  const bridge = useBridge();

  const nativeTokens = useMemo(() => {
    return Object.keys(currenciesConfig).map((i) => Number(i) as WebbCurrencyId);
  }, []);

  const bridgeTokens = useMemo(() => {
    return bridge.getTokens().filter((currency) => currency.currencyId !== WebbCurrencyId.WEBB);
  }, [bridge]);
  const tokens = useMemo(() => {
    const tokens: CurrencyContent[] = [];
    tokens.push(...nativeTokens.map(Currency.fromCurrencyId));
    tokens.push(...bridgeTokens.map(fromBridgeCurrencyToCurrencyView));

    return tokens;
  }, [bridgeTokens, nativeTokens]);
  return (
    <div>
      <TransferWrapper>
        <ChainInput
          chains={chains}
          label={'Select Source Chain'}
          selectedChain={srcChain}
          // TODO: Hook this up to network switcher
          setSelectedChain={async (chainId) => {
            if (typeof chainId !== 'undefined' && activeWallet) {
              const nextChain = chainsStore[chainId];
              await switchChain(nextChain, activeWallet);
            }
          }}
        />
        <SpaceBox height={16} />
        <ChainInput
          label={'Select Destination Chain'}
          chains={chains}
          selectedChain={destChain}
          setSelectedChain={setDestChain}
        />

        <SpaceBox height={16} />

        <InputSection>
          <InputLabel label={'Transfer amount'} />
          <Flex row ai='stretch'>
            <div
              style={{
                position: 'relative',
                maxWidth: '200px',
              }}
            >
              <TokenInput
                wrapperStyles={{
                  top: 0,
                }}
                currencies={tokens}
                onChange={() => {}}
              />
            </div>

            <AmountInputWrapper>
              <InputBase fullWidth placeholder={'Enter amount'} />
              <AmountButton color={'primary'} as={Button}>
                MAX
              </AmountButton>
            </AmountInputWrapper>
          </Flex>
        </InputSection>

        <SpaceBox height={16} />

        <InputSection>
          <InputLabel label={'Recipient'}>
            <InputBase
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value as string);
              }}
              inputProps={{ style: { fontSize: 14 } }}
              fullWidth
              placeholder={`Enter account address`}
            />
          </InputLabel>
        </InputSection>

        <SpaceBox height={16} />

        <MixerButton label={'Transfer'} onClick={() => {}} />
      </TransferWrapper>

      <SpaceBox height={8} />

      <IPDisplay ip={ip.ip} />
    </div>
  );
};

export default PageTransfers;
