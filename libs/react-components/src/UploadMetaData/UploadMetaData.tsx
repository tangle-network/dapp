import { Button, Typography } from '@mui/material';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import React from 'react';

type UploadMetaDataProps = {
  close(): void;

  uploadMetadata(): void;
  visiable: boolean;
};

const UploadMetaData: React.FC<UploadMetaDataProps> = ({ close, uploadMetadata, visiable }) => {
  return (
    <Modal open={visiable} onClose={close}>
      <div>
        <Padding v={2}>
          <Typography variant={'h5'}>Update Polkadot MetaData </Typography>
        </Padding>
        <Padding v as={'footer'}>
          <Flex row ai={'center'} jc={'flex-end'}>
            <Flex>
              <Button onClick={() => {console.log('cancel clicked in UploadMetaData')}}>
                <Padding>Cancel</Padding>
              </Button>
            </Flex>
            <Flex>
              <Button color='primary' onClick={uploadMetadata}>
                <Padding>Save</Padding>
              </Button>
            </Flex>
          </Flex>
        </Padding>
      </div>
    </Modal>
  );
};
export default UploadMetaData;
