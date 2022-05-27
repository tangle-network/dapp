import { Checkbox, FormControlLabel, Icon, IconButton, Tooltip, Typography } from '@material-ui/core';
import { BridgeDepositApi as DepositApi } from '@webb-dapp/bridge/hooks/deposit/useBridgeDeposit';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components';
import { CloseButton } from '@webb-dapp/ui-components/Buttons/CloseButton';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { downloadString } from '@webb-dapp/utils';
import { ChainTypeId, Currency, DepositPayload, MixerSize } from '@webb-tools/api-providers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

import { DepositAmountDecal } from './DepositAmountDecal';

const DepositInfoWrapper = styled.div`
  padding: 1rem 2rem;
  width: 500px;
  min-height: 300px;
  position: relative;
  overflow: hidden;

  .modal-header {
    padding-top: 15px;
    position: relative;
    width: 100%;
  }

  .deposit-modal-alert-header {
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
  }

  .deposit-modal-alert-caption {
    font-family: ${FontFamilies.AvenirNext};
    color: #7c7b86;
    text-align: center;
  }
`;
type DepositInfoProps = {
  open: boolean;
  onClose(): void;
  provider: DepositApi;
  onSuccess(): void;
  mixerSize: MixerSize | undefined;
  destChain: ChainTypeId | undefined;
  wrappableAsset: Currency | null | undefined;
};

const GeneratedNote = styled.p`
  border-radius: 10px;
  padding: 0.7rem;
  word-break: break-all;
  position: relative;
  min-height: 120px;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};

  .copy-button {
    position: absolute;
    padding-top: 10px;
    bottom: 0;
    right: 0;
  }

  .download-button {
    position: absolute;
    padding-top: 10px;
    bottom: 0;
    right: 45px;
  }
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 44;
  height: 100%;
  background: #fff;

  .button {
    top: 20px;
    right: 20px;
  }

  > div {
    height: 200px;
  }
`;

export const DepositConfirm: React.FC<DepositInfoProps> = ({
  destChain,
  mixerSize,
  onClose,
  provider,
  wrappableAsset,
}) => {
  const palette = useColorPallet();
  const { activeChain } = useWebContext();
  const [depositPayload, setNote] = useState<DepositPayload | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const note = useMemo(() => {
    return depositPayload?.note.serialize();
  }, [depositPayload]);

  const downloadNote = useCallback(() => {
    if (!note) {
      return;
    }
    downloadString(note, note.slice(-note.length - 10) + '.txt');
  }, [note]);

  const handleCopy = useCallback((): void => {
    notificationApi.addToQueue({
      secondaryMessage: 'Deposit note is copied to clipboard',
      message: 'Copied  to clipboard',
      variant: 'success',
      Icon: <Icon>content_copy</Icon>,
    });
  }, []);
  useEffect(() => {
    if (typeof destChain === 'undefined' || !mixerSize || !activeChain) {
      return setNote(undefined);
    }

    const wrappableCurrencyAddress: string | undefined = wrappableAsset?.getAddress(activeChain.id);
    provider.generateNote(mixerSize.id, destChain, wrappableCurrencyAddress).then((note) => {
      setNote(note);
    });
  }, [provider, mixerSize, destChain, activeChain, wrappableAsset]);
  const [backupConfirmation, setBackupConfirmation] = useState(false);
  const generatingNote = !depositPayload;
  return (
    <DepositInfoWrapper>
      {generatingNote && (
        <Loading>
          <div>
            <Spinner />
          </div>
          <Typography variant={'h4'} color={'textPrimary'} align={'center'}>
            Generating your deposit note...
          </Typography>
          <Tooltip title={'close'}>
            <CloseButton onClick={onClose} />
          </Tooltip>
        </Loading>
      )}
      <>
        <header className={'modal-header'}>
          <Flex row ai={'center'} jc={'center'}>
            <CloseButton onClick={onClose} />
          </Flex>

          <Typography variant={'h4'} className={'deposit-modal-alert-header'} color={'textPrimary'}>
            <b>Back up your note</b>
          </Typography>
          <SpaceBox height={8} />
          <Typography variant={'body1'} className={'deposit-modal-alert-caption'}>
            Please backup your note. If you lose this. <br /> you won't get your deposit back.
          </Typography>
          <SpaceBox height={20} />
          <DepositAmountDecal amount={mixerSize?.amount || 0} symbol={mixerSize?.asset || 'UNKN'} />
        </header>

        <SpaceBox height={16} />

        {loading ? null : (
          <>
            <GeneratedNote>
              {note}
              <br />
              <Tooltip title={'Download Note'}>
                <IconButton className={'download-button'} onClick={downloadNote}>
                  <Icon>download</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title={`Copy note the clipboard`}>
                <CopyToClipboard onCopy={handleCopy} text={note} {...({ className: 'copy-button' } as any)}>
                  <IconButton>
                    <Icon>content_copy</Icon>
                  </IconButton>
                </CopyToClipboard>
              </Tooltip>
            </GeneratedNote>
          </>
        )}

        <SpaceBox height={8} />

        <FormControlLabel
          value={backupConfirmation}
          onChange={() => {
            setBackupConfirmation((v) => !v);
          }}
          control={<Checkbox color={'primary'} style={{ color: palette.accentColor }} />}
          label={<Typography style={{ color: palette.primaryText }}>I confirm, I backed up the note</Typography>}
        />

        <SpaceBox height={8} />

        <MixerButton
          onClick={async () => {
            if (!depositPayload) {
              return;
            }
            console.log('depositPayload: ', depositPayload);
            setLoading(true);
            downloadNote();
            onClose();
            await provider.deposit(depositPayload);
            setLoading(false);
          }}
          disabled={!backupConfirmation || !depositPayload || loading}
          label={'Deposit'}
        />
      </>
    </DepositInfoWrapper>
  );
};
