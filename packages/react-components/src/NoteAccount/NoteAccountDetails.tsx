import { InputBase, Typography } from '@mui/material';
import { Web3Provider } from '@webb-dapp/api-providers/ext-providers';
import { useDepositNote } from '@webb-dapp/mixer/hooks';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { Keypair, Note } from '@webb-tools/sdk-core';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { ModalNoteDisplay } from '../NoteDisplay/ModalNoteDisplay';
import { ChainNotesList } from './ChainNotesList';

const NoteAccountDetailsWrapper = styled.div`
  width: 440px;
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

type NoteAccountDetailsProps = {
  close(): void;
};

export const NoteAccountDetails: React.FC<NoteAccountDetailsProps> = ({ close }) => {
  const { noteManager } = useWebContext();

  return (
    <NoteAccountDetailsWrapper>
      {!noteManager && <DisconnectedNoteAccountView close={close} />}
      {noteManager && <ConnectedNoteAccountView close={close} />}
    </NoteAccountDetailsWrapper>
  );
};

enum DisconnectView {
  Prompt,
  Login,
  Create,
}

const DisconnectedNoteAccountView: React.FC<NoteAccountDetailsProps> = () => {
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
              className='create-metamask-account-button'
              onClick={async () => {
                console.log('clicked metamask account create');
                const metamask = await Web3Provider.fromExtension();
                console.log(metamask);
                const accounts = await metamask.eth.getAccounts();
                if (accounts.length && accounts[0] != null) {
                  // @ts-ignore
                  const signedString = await metamask.eth.personal.sign('Logging into Webb', accounts[0], undefined);
                  console.log('signedString: ', signedString);
                  loginNoteAccount(signedString.slice(0, 66));
                }
              }}
            >
              Create with MetaMask
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

const ConnectedNoteAccountView: React.FC<NoteAccountDetailsProps> = () => {
  const { logoutNoteAccount, noteManager } = useWebContext();
  const [allNotes, setAllNotes] = useState<Map<string, Note[]>>(new Map());
  const [loadNoteText, setLoadNoteText] = useState('');
  const enteredNote = useDepositNote(loadNoteText);

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
  }, [enteredNote, noteManager]);

  if (noteManager) {
    return (
      <div>
        <div className='account-details'>
          <Typography>Public Key: {noteManager.getKeypair().pubkey.toHexString()}</Typography>
        </div>
        <div className='notes-list'>
          {[...allNotes.entries()].map((entry) => {
            return <ChainNotesList key={`${entry[0]}`} chain={entry[0]} notes={entry[1]} />;
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
        </div>
      </div>
    );
  }
  return <div>Hmmmm where is the note manager?</div>;
};
