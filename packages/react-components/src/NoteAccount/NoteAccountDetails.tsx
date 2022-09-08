import { InputBase, List, Typography } from '@mui/material';
import { Currency } from '@webb-dapp/api-providers/abstracts';
import { Web3Provider } from '@webb-dapp/api-providers/ext-providers';
import { chainsConfig } from '@webb-dapp/apps/configs';
import { useDepositNote } from '@webb-dapp/mixer/hooks';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useCurrencies } from '@webb-dapp/react-hooks/currency';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { getRoundedAmountString } from '@webb-dapp/ui-components/utils';
import { calculateTypedChainId, Keypair, Note } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useState } from 'react';
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
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${({ theme }) => (theme.type === 'dark' ? 'transparent' : '#242424')};
  border: ${({ theme }) => `1px solid ${theme.accentColor}`};

  .resized-amount {
    font-weight: 600;
    letter-spacing: -1px;
    font-size: 20px;
    color: ${({ theme }) => theme.accentColor};
  }

  .resized-symbol {
    font-size: 8px;
    color: ${({ theme }) => theme.accentColor};
  }
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
  const { loginNoteAccount, wallets } = useWebContext();

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
                setAccountInputString(newKey.privkey);
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
                  // @ts-ignore
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
            <ModalNoteDisplay download={() => {}} note={accountInputString} />
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
  const { governedCurrencies, governedCurrency } = useCurrencies();
  const [allNotes, setAllNotes] = useState<Map<string, Note[]>>(new Map());
  const [loadNoteText, setLoadNoteText] = useState('');
  const enteredNote = useDepositNote(loadNoteText);

  const syncNotes = () => {
    if (activeApi && activeApi.state.activeBridge && activeChain && noteManager) {
      activeApi.methods.variableAnchor.actions.inner
        .syncNotesForKeypair(
          activeApi.state.activeBridge.targets[calculateTypedChainId(activeChain.chainType, activeChain.chainId)],
          noteManager.getKeypair()
        )
        .then((notes) => {
          notes
            .filter((note) => note.note.amount !== '0')
            .map((note) => {
              console.log(note.serialize());
              noteManager.addNote(note);
            });
        });
    }
  };

  const removeNote = (chain: string, note: Note) => {
    const chainNotes = allNotes.get(chain);
    if (!chainNotes) {
      return;
    }
    const updatedNotes = chainNotes.filter((chainNote) => chainNote.serialize() != note.serialize());
    allNotes.set(chain, updatedNotes);
    noteManager?.removeNote(note);
  };

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
    const sub = noteManager.$notesUpdated.subscribe(() => {
      setAllNotes(noteManager.getAllNotes());
    });

    return sub.unsubscribe();
  }, [enteredNote, noteManager, noteManager?.notesUpdated]);

  const balances: Map<string, number> = useMemo(() => {
    const tokenBalanceMap = new Map<string, number>();

    allNotes.forEach((chainGroupedNotes) => {
      chainGroupedNotes.map((note) => {
        const assetBalance = tokenBalanceMap.get(note.note.tokenSymbol);
        if (!assetBalance) {
          tokenBalanceMap.set(
            note.note.tokenSymbol,
            Number(ethers.utils.formatUnits(note.note.amount, note.note.denomination))
          );
        } else {
          tokenBalanceMap.set(
            note.note.tokenSymbol,
            assetBalance + Number(ethers.utils.formatUnits(note.note.amount, note.note.denomination))
          );
        }
      });
    });

    return tokenBalanceMap;
  }, [allNotes]);

  if (noteManager) {
    return (
      <div>
        <div className='account-details'>
          <Typography>Public Key: {noteManager.getKeypair().pubkey.toHexString()}</Typography>
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
        <div className='asset-balances' style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[...balances.entries()].map((entry) => {
            return (
              <div key={`${entry[0]}`}>
                {/* Amount chip */}
                <TokenAmountChip>
                  <p className='resized-amount'>{getRoundedAmountString(entry[1])}</p>
                  <p className='resized-symbol'>{entry[0]}</p>
                </TokenAmountChip>
              </div>
            );
          })}
        </div>
        <div className='notes-list'>
          {[...allNotes.entries()].map((entry) => {
            // return <ChainNotesList key={`${entry[0]}`} chain={entry[0]} notes={entry[1]} />;
            return (
              <>
                <Typography variant='h4'>{chainsConfig[Number(entry[0])].name}</Typography>
                <List>
                  {entry[1].map((note, index) => {
                    return (
                      <div>
                        <ItemNoteDisplay
                          note={note}
                          key={`${entry[0]}-${index}`}
                          removeNote={async () => removeNote(entry[0], note)}
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
