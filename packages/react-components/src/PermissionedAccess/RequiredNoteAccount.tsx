import { useWebContext } from '@webb-dapp/react-environment';
import React from 'react';

import { CreateNoteAccount } from './CreateNoteAccount';

type PermissionedAccessProps = {};

export const RequiredNoteAccount: React.FC<PermissionedAccessProps> = ({ children }) => {
  const { noteManager } = useWebContext();

  return (
    <>
      {!noteManager && (
        <div>
          <CreateNoteAccount />
        </div>
      )}
      {noteManager && <div>{children}</div>}
    </>
  );
};
