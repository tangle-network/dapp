import { Currency } from '@nepoche/abstract-api-provider';
import { Chain } from '@nepoche/dapp-config';
import { ChainInput } from '@nepoche/react-components/ChainInput/ChainInput';
import { useWebContext } from '@nepoche/api-provider-environment';
import { InputTitle } from '@nepoche/ui-components/Inputs/InputTitle/InputTitle';
import { TokenInput } from '@nepoche/react-components/TokenInput/TokenInput';
import { above } from '@nepoche/responsive-utils';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const sharedPadding = css`
  padding: 12px 14px;

  ${above.xs(css`
    padding: 25px 35px;
  `)}
`;

const ChainNotesWrapper = styled.div`
  ${sharedPadding}

  .dropdown-inputs {
    display: flex;
    justify-content: space-between;
  }
`;

// The ChainNotesSwitcher will
type ChainNotesSwitcherProps = {
  setValidInput: (isValid: boolean) => void;
  protocol?: 'mixer' | 'vanchor';
};

// The ChainNotesSwitcher will display dropdown inputs of chain + asset combos
// which have notes associated to them in the NoteManager
export const ChainNotesSwitcher: React.FC<ChainNotesSwitcherProps> = ({ protocol, setValidInput }) => {
  const { activeApi, activeChain, chains, noteManager, switchChain } = useWebContext();
  const [selectableChains, setSelectableChains] = useState<Chain[]>([]);
  const [selectableCurrencies, setSelectableCurrencies] = useState<Currency[]>([]);

  const switchToChain = async (newChain: number): Promise<void> => {
    const targetChain = selectableChains.find(
      (chain) => calculateTypedChainId(chain.chainType, chain.chainId) === newChain
    );

    if (!targetChain) {
      return;
    }

    // TODO: Ensure proper api connection on cross-system switch?
    const firstSupportedWallet = Object.values(targetChain.wallets)[0];
    await switchChain(targetChain, firstSupportedWallet);
  };

  // If the activeChain changes, set the selected note

  // Set the available chain options based on the NoteManager
  useEffect(() => {
    if (!noteManager || !activeApi) {
      return;
    }
    const allSupportedCurrencies = Object.values(activeApi.state.getCurrencies());

    const supportedChainOptions: Chain[] = [];
    const supportedCurrenciesOptions: Currency[] = [];

    for (const chainGroupedNotes of noteManager.getAllNotes().entries()) {
      const typedChainId = Number(chainGroupedNotes[0]);

      chainGroupedNotes[1].map((note) => {
        // Only add the note if the currency has not yet been added
        if (!supportedCurrenciesOptions.find((currency) => currency.view.symbol === note.note.tokenSymbol)) {
          const noteCurrency = allSupportedCurrencies.find(
            (currency) => currency.view.symbol === note.note.tokenSymbol
          );
          if (noteCurrency) {
            if (protocol) {
              // Add the note if it is for the desired protocol
              if (note.note.protocol === protocol) {
                supportedCurrenciesOptions.push(noteCurrency);
              }
            } else {
              // If no protocol indicated, add the currency option
              supportedCurrenciesOptions.push(noteCurrency);
            }
          }
        }
      });

      // Add the chain entry as supported
      if (chains[typedChainId] && supportedCurrenciesOptions.length) {
        supportedChainOptions.push(chains[typedChainId]);
      }
    }
    setSelectableChains(supportedChainOptions);
    setSelectableCurrencies(supportedCurrenciesOptions);
  }, [noteManager, activeApi, chains, protocol]);

  const checkValidInput = useMemo(() => {
    if (activeChain) {
      if (activeApi && activeApi.state.activeBridge) {
        if (
          noteManager
            ?.getNotesOfChain(calculateTypedChainId(activeChain.chainType, activeChain.chainId))
            ?.find(
              (note) =>
                note.note.protocol === protocol &&
                note.note.tokenSymbol === activeApi.state.activeBridge?.currency.view.symbol
            )
        ) {
          return true;
        }
      }
    }

    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, activeApi, noteManager, noteManager?.notesUpdated, protocol]);

  // set the validity flag if a note exists for the activeChain / activeBridge combo.
  useEffect(() => {
    setValidInput(checkValidInput);

    const noteUpdateSub = noteManager?.$notesUpdated.subscribe(() => {
      setValidInput(checkValidInput);
    });

    return noteUpdateSub && noteUpdateSub.unsubscribe();
  }, [checkValidInput, noteManager, setValidInput]);

  return (
    <ChainNotesWrapper>
      <InputTitle leftLabel='CHAIN' rightLabel='CURRENCY' />
      <div className='dropdown-inputs'>
        <ChainInput
          chains={selectableChains.map((chain) => {
            return calculateTypedChainId(chain.chainType, chain.chainId);
          })}
          selectedChain={activeChain ? calculateTypedChainId(activeChain?.chainType, activeChain?.chainId) : undefined}
          setSelectedChain={switchToChain}
          wrapperStyles={{ width: '45%' }}
        />
        <TokenInput
          currencies={selectableCurrencies}
          value={activeApi?.state.activeBridge?.currency}
          onChange={function (next: Currency): void {
            // Only change from the dropdown if the token is available on the api
            if (activeApi && activeApi.state.getBridgeOptions()[next.id]) {
              activeApi?.methods.bridgeApi.setBridgeByCurrency(next);
            }
          }}
          wrapperStyles={{ width: '45%' }}
        />
      </div>
    </ChainNotesWrapper>
  );
};
