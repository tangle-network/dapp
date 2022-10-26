import { InputBase, List, Typography } from '@mui/material';
import { Currency } from '@nepoche/abstract-api-provider/currency';
import { chainsConfig } from '@nepoche/dapp-config/chains';
import { useWebContext } from '@nepoche/api-provider-environment';
import { useCurrencies } from '@nepoche/react-hooks/currency';
import { useDepositNote } from '@nepoche/react-hooks/note';
import { useNoteAccount } from '@nepoche/react-hooks/useNoteAccount';
import { TokenInput } from '@nepoche/react-components/TokenInput/TokenInput';
import { Pallet } from '@nepoche/styled-components-theme';
import { getRoundedAmountString } from '@nepoche/ui-components/utils';
import { Web3Provider } from '@nepoche/web3-api-provider';
import { calculateTypedChainId, Keypair } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { ItemNoteDisplay } from '../NoteDisplay/ItemNoteDisplay';
import { ModalNoteDisplay } from '../NoteDisplay/ModalNoteDisplay';

const NoteAccountDetailsWrapper = styled.div`
  padding: 20px;

  .account-details {
    margin-bottom: 30px;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
  }

  .load-notes {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    padding: 0 12px;
    border-radius: 10px;
  }
`;

const TokenAmountChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => (theme.type === 'dark' ? 'transparent' : '#242424')};
  border: ${({ theme }) => `1px solid ${theme.accentColor}`};
`;

export const NoteAccountDetails: React.FC = () => {
  const { noteManager } = useWebContext();

  return (
    <NoteAccountDetailsWrapper>
      {!noteManager && <DisconnectedNoteAccountView />}
      {noteManager && <ConnectedNoteAccountView />}
    </NoteAccountDetailsWrapper>
  );
};

enum DisconnectView {
  Prompt,
  Login,
  Create,
}

const DisconnectedNoteAccountView: React.FC = () => {
  const [view, setView] = useState<DisconnectView>(DisconnectView.Prompt);
  const [accountInputString, setAccountInputString] = useState('');
  const { loginNoteAccount } = useWebContext();

  return (
    <div>
      {view === DisconnectView.Prompt && (
        <>
          <div>
            <button className='login-prompt-button' onClick={() => setView(DisconnectView.Login)}>
              Login
            </button>
          </div>
          <div>
            <button
              className='create-random-account-button'
              onClick={() => {
                const newKey = new Keypair();
                setAccountInputString(newKey.privkey!);
                setView(DisconnectView.Create);
              }}
            >
              Create Random
            </button>
            <button
              className='login-metamask-account-button'
              onClick={async () => {
                const metamask = await Web3Provider.fromExtension();
                const accounts = await metamask.eth.getAccounts();
                if (accounts.length && accounts[0] != null) {
                  const signedString = await metamask.eth.personal.sign('Logging into Webb', accounts[0], undefined);
                  loginNoteAccount(signedString.slice(0, 66));
                }
              }}
            >
              Login with MetaMask
            </button>
          </div>
        </>
      )}
      {view === DisconnectView.Login && (
        <>
          <div>
            <div className='account-input'>
              <InputBase
                value={accountInputString}
                onChange={(event) => {
                  setAccountInputString(event.target.value as string);
                }}
                inputProps={{ style: { fontSize: 14 } }}
                fullWidth
                placeholder={`Paste your NoteAccountString here`}
              />
            </div>
          </div>
          <button
            className='login-button'
            onClick={() => {
              // Simplistic validation
              if (accountInputString.length === 66) {
                loginNoteAccount(accountInputString);
              }
            }}
          >
            Login
          </button>
        </>
      )}
      {view === DisconnectView.Create && (
        <>
          <div>
            <ModalNoteDisplay download={() => {console.log('download')}} note={accountInputString} />
          </div>
          <button
            className='create-button'
            onClick={() => {
              // Simplistic validation
              if (accountInputString.length === 66) {
                loginNoteAccount(accountInputString);
              }
            }}
          >
            Create
          </button>
        </>
      )}
    </div>
  );
};

const ConnectedNoteAccountView: React.FC = () => {
  const { activeApi, activeChain, logoutNoteAccount, noteManager, purgeNoteAccount } = useWebContext();
  const { allNotes } = useNoteAccount();
  const { governedCurrencies, governedCurrency } = useCurrencies();
  const [loadNoteText, setLoadNoteText] = useState('');
  const enteredNote = useDepositNote(loadNoteText);

  const syncNotes = useCallback(async () => {
    if (activeApi && activeApi.state.activeBridge && activeChain && noteManager) {
      const chainNotes = await activeApi.methods.variableAnchor.actions.inner.syncNotesForKeypair(
        activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)],
        noteManager.getKeypair()
      );

      await Promise.all(
        chainNotes
          // Do not display notes that have zero value.
          .filter((note) => note.note.amount !== '0')
          .map(async (note) => {
            console.log(note.serialize());
            await noteManager.addNote(note);
            return note;
          })
      );
    }
  }, [activeApi, activeChain, noteManager]);

  // On note input change, if the text is successfully parsed as a note, give it to the NoteManager
  // and clear the input.
  useEffect(() => {
    if (!noteManager) {
      return;
    }
    if (enteredNote) {
      noteManager.addNote(enteredNote).then(() => {
        setLoadNoteText('');
      });
    }
  }, [enteredNote, noteManager]);

  const getBalancesForChain = useCallback(
    (typedChainId: string): Map<string, number> => {
      const chainBalances: Map<string, number> = new Map();
      const chainGroupedNotes = allNotes.get(typedChainId);

      if (!chainGroupedNotes) {
        return new Map();
      }

      chainGroupedNotes.map((note) => {
        const assetBalance = chainBalances.get(note.note.tokenSymbol);
        if (!assetBalance) {
          chainBalances.set(
            note.note.tokenSymbol,
            Number(ethers.utils.formatUnits(note.note.amount, note.note.denomination))
          );
        } else {
          chainBalances.set(
            note.note.tokenSymbol,
            assetBalance + Number(ethers.utils.formatUnits(note.note.amount, note.note.denomination))
          );
        }
      });

      return chainBalances;
    },
    [allNotes]
  );

  const cumulativeBalances: Map<string, number> = useMemo(() => {
    if (!noteManager) {
      return new Map();
    }

    const tokenBalanceMap = new Map<string, number>();

    const chainGroupedBalances = [...allNotes.keys()].map((typedChainId) => {
      return getBalancesForChain(typedChainId);
    });

    for (const chainBalance of chainGroupedBalances) {
      for (const assetBalanceEntry of chainBalance) {
        const previousAssetBalance = tokenBalanceMap.get(assetBalanceEntry[0]);
        if (!previousAssetBalance) {
          tokenBalanceMap.set(assetBalanceEntry[0], assetBalanceEntry[1]);
        } else {
          tokenBalanceMap.set(assetBalanceEntry[0], assetBalanceEntry[1] + previousAssetBalance);
        }
      }
    }

    return tokenBalanceMap;
  }, [allNotes, getBalancesForChain, noteManager]);

  if (noteManager) {
    return (
      <div>
        <div className='account-details'>
          <Typography>Public Key: {noteManager.getKeypair().toString()}</Typography>
        </div>
        <div className='sync-notes' style={{ display: 'flex' }}>
          <button
            onClick={syncNotes}
            disabled={activeApi ? false : true}
            style={{ paddingRight: '20px', height: '20px' }}
          >
            Sync notes for
          </button>
          <TokenInput
            currencies={governedCurrencies}
            value={governedCurrency}
            onChange={(currency: Currency) => {
              if (!activeApi) {
                return;
              }

              activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
            }}
            wrapperStyles={{ display: 'flex' }}
          />
        </div>
        <Typography variant='h3'>Total Asset Balances:</Typography>
        <div className='cumulative-asset-balances' style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[...cumulativeBalances.entries()].map((entry) => {
            return (
              <div key={`${entry[0]}`}>
                {/* Amount chip */}
                <TokenAmountChip>
                  <Typography variant='h6'>{getRoundedAmountString(entry[1])}</Typography>
                  <Typography variant='h6'>{entry[0]}</Typography>
                </TokenAmountChip>
              </div>
            );
          })}
        </div>
        <div className='sync-notes' style={{ display: 'flex' }}>
          <button
            onClick={syncNotes}
            disabled={activeApi ? false : true}
            style={{ paddingRight: '20px', height: '20px' }}
          >
            Sync notes for
          </button>
          <TokenInput
            currencies={governedCurrencies}
            value={governedCurrency}
            onChange={(currency: Currency) => {
              if (!activeApi) {
                return;
              }

              activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
            }}
            wrapperStyles={{ display: 'flex' }}
          />
        </div>
        <Typography variant='h3'>Total Asset Balances:</Typography>
        <div className='cumulative-asset-balances' style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[...cumulativeBalances.entries()].map((entry) => {
            return (
              <div key={`${entry[0]}`}>
                {/* Amount chip */}
                <TokenAmountChip>
                  <Typography variant='h6'>{getRoundedAmountString(entry[1])}</Typography>
                  <Typography variant='h6'>{entry[0]}</Typography>
                </TokenAmountChip>
              </div>
            );
          })}
        </div>
        <div className='notes-list'>
          {[...allNotes.entries()].map((entry) => {
            // return <ChainNotesList key={`${entry[0]}`} chain={entry[0]} notes={entry[1]} />;
            const assetBalancesMap = getBalancesForChain(entry[0]);
            return (
              <>
                <Typography variant='h4'>{chainsConfig[Number(entry[0])].name}</Typography>
                <Typography variant='h5' style={{ paddingLeft: '40px' }}>
                  Balances:
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  {[...assetBalancesMap.entries()].map((entry) => {
                    return (
                      <TokenAmountChip>
                        <Typography variant='h6'>{getRoundedAmountString(entry[1])}</Typography>
                        <Typography variant='h6'>{entry[0]}</Typography>
                      </TokenAmountChip>
                    );
                  })}
                </div>
                <Typography variant='h5' style={{ paddingLeft: '40px' }}>
                  Notes:
                </Typography>
                <List>
                  {entry[1].map((note, index) => {
                    return (
                      <div style={{ display: 'flex' }}>
                        <ItemNoteDisplay
                          note={note}
                          key={`${entry[0]}-${index}`}
                          removeNote={() => noteManager?.removeNote(note)}
                        />
                      </div>
                    );
                  })}
                </List>
              </>
            );
          })}
        </div>
        <div className='load-notes'>
          <InputBase
            fullWidth
            placeholder={`Load notes`}
            value={loadNoteText}
            inputProps={{ style: { fontSize: 14 } }}
            onChange={(event) => {
              setLoadNoteText(event.target.value as string);
            }}
          />
        </div>
        <div className='account-actions'>
          <div className='logout-button'>
            <button
              onClick={() => {
                logoutNoteAccount();
              }}
            >
              Logout
            </button>
          </div>
          <div className='purge-account-button'>
            <button
              onClick={() => {
                purgeNoteAccount();
              }}
            >
              Purge account
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <div>Hmmmm where is the note manager?</div>;
};
