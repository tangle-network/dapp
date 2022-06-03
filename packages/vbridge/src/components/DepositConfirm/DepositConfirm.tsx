import { Checkbox, FormControlLabel, Icon, IconButton, Tooltip, Typography } from '@material-ui/core';
import { ChainTypeId, Currency, DepositPayload } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { useCopyable } from '@webb-dapp/react-hooks/useCopyable';
import { SpaceBox } from '@webb-dapp/ui-components';
import { CloseButton } from '@webb-dapp/ui-components/Buttons/CloseButton';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { downloadString } from '@webb-dapp/utils';
import { VBridgeDepositApi as DepositApi } from '@webb-dapp/vbridge/hooks/deposit/useBridgeDeposit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  anchorId: number | string;
  amount: number;
  destChain: ChainTypeId | undefined;
  wrappableAsset: Currency | null | undefined;
};

const GeneratedNote = styled.div`
  border-radius: 10px;
  padding: 0.7rem;
  word-break: break-all;
  position: relative;
  min-height: 120px;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};

  .copy-button {
    display: block;
  }

  .download-button {
    display: block;
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

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const DepositConfirm: React.FC<DepositInfoProps> = ({
  amount,
  anchorId,
  destChain,
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

  const { copy, isCopied } = useCopyable();
  const handleCopy = useCallback((): void => {
    copy(note ?? '');

    notificationApi.addToQueue({
      secondaryMessage: 'Deposit note is copied to clipboard',
      message: 'Copied  to clipboard',
      variant: 'success',
      Icon: <Icon>content_copy</Icon>,
    });
  }, [note, copy]);

  useEffect(() => {
    if (typeof destChain === 'undefined' || !amount || !activeChain) {
      return setNote(undefined);
    }

    const wrappableCurrencyAddress: string | undefined = wrappableAsset?.getAddress(activeChain.id);
    provider.generateNote(anchorId, destChain, amount, wrappableCurrencyAddress).then((note) => {
      setNote(note);
    });
  }, [provider, anchorId, amount, destChain, activeChain, wrappableAsset]);

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
            {/* for `Tooltip` forwardRef */}
            <span>
              <CloseButton onClick={onClose} />
            </span>
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
          <DepositAmountDecal amount={amount} symbol={provider.selectedBridgeCurrency?.view.symbol || 'UNKN'} />
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
                <Tooltip title={isCopied ? `Copied` : `Copy to clipboard`}>
                  <IconButton onClick={handleCopy} {...({ className: 'copy-button' } as any)}>
                    <Icon>content_copy</Icon>
                  </IconButton>
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
