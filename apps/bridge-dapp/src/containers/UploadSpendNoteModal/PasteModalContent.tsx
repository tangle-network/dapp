import {
  Button,
  FileUploadField,
  FileUploadList,
} from '@webb-tools/webb-ui-components';
import { useState } from 'react';
import { uniqueId } from 'lodash';

const initialNotes = {
  [uniqueId()]: '',
};

export const PasteModalContent = () => {
  // The raw notes string array from the user
  const [rawNotes, setRawNotes] =
    useState<Record<string, string>>(initialNotes);

  return (
    <>
      <FileUploadList title="Paste spend notes below:">
        {Object.entries(rawNotes).map(([id, note]) => (
          <FileUploadField
            key={id}
            value={note}
            onChange={(value) => {
              setRawNotes((prev) => ({ ...prev, [id]: value }));
            }}
          />
        ))}
      </FileUploadList>

      <Button
        onClick={() => setRawNotes((prev) => ({ ...prev, [uniqueId()]: '' }))}
        variant="link"
        size="sm"
        className="mt-2"
      >
        Add more
      </Button>
    </>
  );
};
