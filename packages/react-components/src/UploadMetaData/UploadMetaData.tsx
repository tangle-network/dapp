import React from 'react';
import styled from 'styled-components';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Button, Typography } from '@material-ui/core';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';

const UploadMetaDataWrapper = styled.div``;
type UploadMetaDataProps = {
  close(): void;

  uploadMetadata(): void;
  visiable: boolean;
};

const UploadMetaData: React.FC<UploadMetaDataProps> = ({ close, uploadMetadata, visiable }) => {
  return (
    <Modal open={visiable} onClose={close}>
      <UploadMetaDataWrapper>
        <Padding v={2}>
          <Typography variant={'h5'}>Update Polkadot MetaData </Typography>
        </Padding>
        <Padding v as={'footer'}>
          <Flex row ai={'center'} jc={'flex-end'}>
            <Flex>
              <Button onClick={() => {}}>
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
      </UploadMetaDataWrapper>
    </Modal>
  );
};
export default UploadMetaData;
