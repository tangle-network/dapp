import { ButtonBase, Checkbox, FormControlLabel, Icon, IconButton, Tooltip, Typography } from '@material-ui/core';
import { ChainTypeId, DepositPayload, MixerSize } from '@webb-dapp/api-providers';
import { DepositAmountDecal } from '@webb-dapp/bridge/components/DepositConfirm/DepositAmountDecal';
import { DepositApi } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { SpaceBox } from '@webb-dapp/ui-components';
import { CloseButton } from '@webb-dapp/ui-components/Buttons/CloseButton';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { downloadString } from '@webb-dapp/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

const DismissWrapper = styled.button``;
const Dismiss = () => {
  return <DismissWrapper>dismiss</DismissWrapper>;
};

const DepositInfoWrapper = styled.div`
  padding: 1rem 2rem;
  width: 500px;
  min-height: 300px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }: { theme: Pallet }) => theme.modalBackground};

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
    text-align: center;
  }
`;
type DepositInfoProps = {
  open: boolean;
  onClose(): void;
  provider: DepositApi;
  onSuccess(): void;
  mixerSize: MixerSize | undefined;
};

const GeneratedNote = styled.p`
  border-radius: 10px;
  padding: 0.7rem;
  border: 1px solid #ebeefd;
  word-break: break-all;
  position: relative;
  min-height: 120px;
  color: ${({ theme }) => theme.primaryText};

  .copy-button {
    display: block;
  }

  .download-button {
    display: block;
  }
`;
const CloseDepositModal = styled.button`
  &&& {
    position: absolute;
    right: 20px;
  }
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 44;
  height: 100%;
  background: ${({ theme }: { theme: Pallet }) => (theme.type === 'dark' ? theme.spinnerBackground : '#fff')};

  ${CloseDepositModal} {
    top: 20px;
    right: 20px;
  }

  > div {
    height: 200px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const DepositConfirm: React.FC<DepositInfoProps> = ({ mixerSize, onClose, onSuccess, open, provider }) => {
  const palette = useColorPallet();
  const [depositPayload, setNote] = useState<DepositPayload | undefined>(undefined);
  const { activeChain } = useWebContext();
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
    if (!mixerSize || !activeChain) {
      return;
    }
    let desiredMixer: string | number = '';
    // MixerIds may be strings or numbers. EVM Mixer ids will have a 'Bridge' prefix.
    if (typeof mixerSize.id === 'string') {
      mixerSize.id.includes('Bridge') ? (desiredMixer = mixerSize.id) : (desiredMixer = Number(mixerSize.id));
    }
    const chainIdType: ChainTypeId = {
      chainType: activeChain.chainType,
      chainId: activeChain.chainId,
    };

    provider.generateNote(desiredMixer, chainIdType).then((note) => {
      setNote(note);
    });
  }, [provider, mixerSize, activeChain]);
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
            <CloseDepositModal as={ButtonBase} onClick={onClose}>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M12.5074 10L19.5575 2.94985C20.1475 2.35988 20.1475 1.35693 19.5575 0.766962L19.233 0.442478C18.6431 -0.147493 17.6401 -0.147493 17.0501 0.442478L10 7.49263L2.94985 0.442478C2.35988 -0.147493 1.35693 -0.147493 0.766962 0.442478L0.442478 0.766962C-0.147493 1.35693 -0.147493 2.35988 0.442478 2.94985L7.49263 10L0.442478 17.0501C-0.147493 17.6401 -0.147493 18.6431 0.442478 19.233L0.766962 19.5575C1.35693 20.1475 2.35988 20.1475 2.94985 19.5575L10 12.5074L17.0501 19.5575C17.6401 20.1475 18.6431 20.1475 19.233 19.5575L19.5575 19.233C20.1475 18.6431 20.1475 17.6401 19.5575 17.0501L12.5074 10Z'
                  fill='#C8CEDD'
                />
              </svg>
            </CloseDepositModal>
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
              <Actions>
                <Tooltip title={'Download Note'}>
                  <IconButton className={'download-button'} onClick={downloadNote}>
                    <Icon>download</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Copy note the clipboard`}>
                  <CopyToClipboard onCopy={handleCopy} text={note} {...({ className: 'copy-buton' } as any)}>
                    <IconButton>
                      <Icon>content_copy</Icon>
                    </IconButton>
                  </CopyToClipboard>
                </Tooltip>
              </Actions>
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
          label={<Typography color={'textPrimary'}>I confirm, I backed up the note</Typography>}
        />

        <SpaceBox height={8} />

        <MixerButton
          onClick={async () => {
            if (!depositPayload) {
              return;
            }
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
