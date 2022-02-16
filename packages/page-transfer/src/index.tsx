import { Button, InputBase } from '@material-ui/core';
import { ChainType, currenciesConfig, InternalChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { ChainInput } from '@webb-dapp/ui-components/Inputs/ChainInput/ChainInput';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

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

  const chains: [ChainType, InternalChainId][] = useMemo(() => {
    const arr: [ChainType, InternalChainId][] = [];
    Object.entries(chainsStore).forEach((el) => {
      arr.push([el[1].chainType, Number(el[0])]);
    });
    return arr;
  }, [chainsStore]);

  const srcChain: [ChainType, InternalChainId] | undefined = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return [activeChain.chainType, activeChain.id];
  }, [activeChain]);
  const [destChain, setDestChain] = useState<[ChainType, InternalChainId] | undefined>(undefined);
  const [recipient, setRecipient] = useState('');
  const bridge = useBridge();

  console.log(destChain);

  const tokens = useMemo(() => {
    const tokens: CurrencyContent[] = [];
    tokens.push(...Object.keys(currenciesConfig).map((id) => Currency.fromCurrencyId(Number(id))));

    return tokens;
  }, []);
  return (
    <div>
      <ContentWrapper>
        <ChainInput
          chains={chains}
          label={'Select Source Chain'}
          selectedChain={srcChain}
          // TODO: Hook this up to network switcher
          setSelectedChain={async (chainTypeInternalChainId) => {
            if (typeof chainTypeInternalChainId !== 'undefined' && activeWallet) {
              const nextChain = chainsStore[chainTypeInternalChainId[1]];
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
      </ContentWrapper>
    </div>
  );
};

export default PageTransfers;
