import { ButtonBase, Checkbox, FormControlLabel, Icon, IconButton, Tooltip, Typography } from '@material-ui/core';
import { DepositApi } from '@webb-dapp/mixer/hooks/deposit/useDeposit';
import { DepositPayload, useWebContext } from '@webb-dapp/react-environment/webb-context';
import { SpaceBox } from '@webb-dapp/ui-components';
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
import { ethers } from 'ethers';

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
  background: ${({ theme }: { theme: Pallet }) => (theme.type === 'dark' ? theme.spinnerBackground : '#fff')};

  .modal-header {
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
  mixerId: number | string;
};

const GeneratedNote = styled.p`
  border-radius: 10px;
  padding: 0.7rem;
  border: 1px solid #ebeefd;
  word-break: break-all;
  position: relative;
  min-height: 120px;

  .copy-button {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .download-button {
    position: absolute;
    bottom: 0;
    right: 45px;
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

export const DepositConfirm: React.FC<DepositInfoProps> = ({ mixerId, onClose, onSuccess, open, provider }) => {
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
    let desiredMixer: string | number;
    // If the mixerId is of string type, it could either be an address or a mixerId intended for use in substrate
    if (typeof mixerId === 'string') ethers.utils.isAddress(mixerId) ? desiredMixer = mixerId : desiredMixer = Number(mixerId);
    provider.generateNote(desiredMixer, activeChain?.id).then((note) => {
      setNote(note);
    });
  }, [provider, mixerId, activeChain]);
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
            <div>
              <svg width='135' height='40' viewBox='0 0 135 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='20' cy='20' r='20' fill='#3351F2' />
                <path
                  d='M31.1845 19.954C31.4687 19.954 31.6726 20.0153 31.7961 20.1381C31.932 20.2608 32 20.4204 32 20.6168C32 20.9359 31.9012 21.2183 31.7035 21.4638C31.5181 21.7092 31.2216 21.8381 30.8139 21.8504C29.8378 21.8627 28.9605 21.789 28.1821 21.6295C27.3172 23.4584 26.2732 24.9804 25.05 26.1956C23.8391 27.3985 22.6406 28 21.4545 28C20.3672 28 19.5517 27.4292 19.0081 26.2877C18.4644 25.1339 18.1555 23.5934 18.0814 21.6663C17.34 23.8021 16.4999 25.3916 15.5608 26.435C14.6342 27.4783 13.6457 28 12.5955 28C11.4093 28 10.5136 27.2697 9.90814 25.809C9.30271 24.336 9 22.3598 9 19.8803C9 18.0759 9.16062 16.0936 9.48187 13.9333C9.56836 13.3195 9.7228 12.896 9.94521 12.6628C10.18 12.4173 10.5445 12.2946 11.0387 12.2946C11.4093 12.2946 11.6935 12.3744 11.8912 12.5339C12.1013 12.6935 12.2063 12.9881 12.2063 13.4177C12.2063 13.5036 12.1939 13.6694 12.1692 13.9148C11.7985 16.4311 11.6132 18.5731 11.6132 20.3406C11.6132 21.9854 11.7553 23.2558 12.0395 24.1519C12.3237 25.0479 12.7067 25.496 13.1886 25.496C13.621 25.496 14.1399 25.0479 14.7454 24.1519C15.3631 23.2436 15.9748 21.9056 16.5802 20.1381C17.1856 18.3583 17.6984 16.2409 18.1185 13.786C18.2173 13.2213 18.3965 12.8347 18.6559 12.626C18.9277 12.4051 19.2922 12.2946 19.7494 12.2946C20.1324 12.2946 20.4104 12.3805 20.5834 12.5524C20.7687 12.7119 20.8614 12.9574 20.8614 13.2888C20.8614 13.4852 20.849 13.6387 20.8243 13.7491C20.4784 15.7499 20.3054 17.7507 20.3054 19.7514C20.3054 21.1139 20.3486 22.2002 20.4351 23.0104C20.534 23.8205 20.7131 24.4404 20.9726 24.87C21.2444 25.2873 21.6336 25.496 22.1402 25.496C22.7333 25.496 23.3943 25.0541 24.1233 24.1703C24.8523 23.2743 25.5195 22.1634 26.1249 20.8377C25.3712 20.3713 24.8028 19.7699 24.4198 19.0334C24.0368 18.2846 23.8453 17.4254 23.8453 16.4557C23.8453 15.486 23.9936 14.6697 24.2901 14.0069C24.599 13.3318 25.0129 12.8285 25.5318 12.4971C26.0631 12.1657 26.65 12 27.2925 12C28.0833 12 28.7072 12.2823 29.1644 12.8469C29.6339 13.4116 29.8687 14.1849 29.8687 15.1669C29.8687 16.5539 29.5659 18.0944 28.9605 19.7883C29.5907 19.8987 30.332 19.954 31.1845 19.954ZM25.7172 16.3268C25.7172 17.5297 26.1064 18.4196 26.8848 18.9965C27.3666 17.6218 27.6076 16.4864 27.6076 15.5903C27.6076 15.0748 27.5396 14.7004 27.4037 14.4672C27.2678 14.2217 27.0825 14.099 26.8477 14.099C26.5141 14.099 26.2423 14.2954 26.0322 14.6881C25.8222 15.0687 25.7172 15.6149 25.7172 16.3268Z'
                  fill='white'
                />
                <circle cx='115' cy='20' r='20' fill='#3351F2' fillOpacity='0.05' />
                <path
                  d='M122 14C122 13.4477 121.552 13 121 13L112 13C111.448 13 111 13.4477 111 14C111 14.5523 111.448 15 112 15L120 15L120 23C120 23.5523 120.448 24 121 24C121.552 24 122 23.5523 122 23L122 14ZM109.707 26.7071L121.707 14.7071L120.293 13.2929L108.293 25.2929L109.707 26.7071Z'
                  fill='#3351F2'
                />
                <line x1='51' y1='15' x2='84' y2='15' stroke='#474553' strokeWidth='2' strokeDasharray='3 3' />
                <line x1='51' y1='20' x2='84' y2='20' stroke='#474553' strokeWidth='2' strokeDasharray='3 3' />
                <line x1='51' y1='25' x2='84' y2='25' stroke='#474553' strokeWidth='2' strokeDasharray='3 3' />
              </svg>
            </div>
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
          </Flex>

          <SpaceBox height={16} />

          <Typography variant={'h3'} className={'deposit-modal-alert-header'} color={'textPrimary'}>
            Not so fast! <b>Back up your note.</b>
          </Typography>
          <SpaceBox height={8} />
          <Typography variant={'body1'} className={'deposit-modal-alert-caption'} color={'textPrimary'}>
            Please backup your note. If you lose this,
            <br /> you won't get your deposit back.
          </Typography>
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
          control={<Checkbox color={'primary'} />}
          label={<Typography color={'textPrimary'}>I confirm,I backed up the note</Typography>}
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
