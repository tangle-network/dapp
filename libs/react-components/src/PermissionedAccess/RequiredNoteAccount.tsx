import { useWebContext } from '@nepoche/api-provider-environment';
import React from 'react';

import { CreateNoteAccount } from './CreateNoteAccount';

type PermissionedAccessProps = {
  children: React.ReactNode;
};

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
