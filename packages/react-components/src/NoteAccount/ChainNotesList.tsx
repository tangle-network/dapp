import { List, Typography } from '@mui/material';
import { chainsConfig } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Note } from '@webb-tools/sdk-core';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ItemNoteDisplay } from '../NoteDisplay/ItemNoteDisplay';

const ChainNotesListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

type ChainNotesListProps = {
  chain: string;
  notes: Note[];
};

export const ChainNotesList: React.FC<ChainNotesListProps> = ({ chain, notes }) => {
  const { noteManager } = useWebContext();
  const [listNotes, setListNotes] = useState<Note[]>(notes);
  const chainConfig = chainsConfig[Number(chain)];

  const removeNote = (note: Note) => {
    setListNotes(listNotes.filter((listNote) => listNote.serialize() != note.serialize()));
    noteManager?.removeNote(note);
  };

  return (
    <ChainNotesListWrapper>
      <Typography variant='h4'>{chainConfig.name}</Typography>
      <List>
        {listNotes.map((note, index) => {
          return (
            <div>
              <ItemNoteDisplay note={note} key={`${chain}-${index}`} removeNote={async () => removeNote(note)} />
            </div>
          );
        })}
      </List>
    </ChainNotesListWrapper>
  );
};
