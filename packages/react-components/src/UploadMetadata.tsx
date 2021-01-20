import { Dialog, Typology } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

interface UploadMetadataProps {
  uploadMetadata: () => Promise<void>;
  visiable: boolean;
  close: () => void;
}

export const UploadMetadata: FC<UploadMetadataProps> = ({ close, uploadMetadata, visiable }) => {
  return (
    <Dialog
      cancelText={'Cancel'}
      confirmText={'Upload'}
      onCancel={close}
      onConfirm={uploadMetadata}
      showCancel={true}
      visiable={visiable}
    >
      <Typology.Body>Upload metadata for best experience.</Typology.Body>
    </Dialog>
  );
};
