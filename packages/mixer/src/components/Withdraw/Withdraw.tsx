import { FormHelperText, InputBase, Typography } from '@material-ui/core';
import { chainsPopulated, currenciesConfig, getChainNameFromChainId, parseChainIdType } from '@webb-dapp/apps/configs';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { WithdrawingModal, WithdrawSuccessModal } from '@webb-dapp/react-components/Withdraw';
import { useWebContext } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { SettingsIcon } from '@webb-dapp/ui-components/assets/SettingsIcon';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { MixerNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/MixerNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { FeesInfo, RelayerApiAdapter } from '@webb-dapp/ui-components/RelayerInput/RelayerInput';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { WithdrawState } from '@webb-tools/api-providers';
import { WalletConfig } from '@webb-tools/api-providers/types/wallet-config.interface';
import { ActiveWebbRelayer } from '@webb-tools/api-providers/webb-context/relayer';
import { Note } from '@webb-tools/sdk-core';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const WithdrawWrapper = styled.div<{ wallet: WalletConfig | undefined }>`
  ${({ theme, wallet }) => {
    if (wallet) return css``;
    else
      return css`
        padding: 25px 35px;
        background: ${theme.layer2Background};
        border: 1px solid ${theme.borderColor};
        border-radius: 0 0 13px 13px;
      `;
  }}
  background: ${({ theme }) => theme.lightSelectionBackground};
  border-radius: 10px;
  .titles-and-information {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const RelayerSettings = styled.div`
  box-sizing: border-box;
  .wallet-logo-wrapper {
    width: 20px;
    height: 20px;
    background: transparent;
  }
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  height: 45px;
  border-radius: 12px;
`;

const WithdrawNoteSection = styled.div`
  padding: 25px 35px;
  background: ${({ theme }) => theme.layer1Background};
  .note-input {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    border-radius: 10px;
    padding: 5px;
  }
`;

const AddressAndInfoSection = styled.div`
  background: ${({ theme }) => theme.layer2Background};
  border-radius: 13px;
  border: 1px solid ${({ theme }) => theme.borderColor};
  .address-input {
    display: flex;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    padding: 5px;
    margin: 0px 35px;
    border-radius: 10px;
  }
  .information-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 35px;
    .title {
      color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
    }
    .value {
      color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }
  .total-amount {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 35px;
    background: ${({ theme }) => theme.heavySelectionBackground};
    .title {
      color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
    }
    .value {
      color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }
`;

type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const depositNote = useDepositNote(note);

  const [recipient, setRecipient] = useState('');
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [fees, setFees] = useState('');
  const { activeApi, activeChain, activeWallet } = useWebContext();

  const {
    canCancel,
    cancelWithdraw,
    receipt,
    relayerMethods,
    relayersState,
    setReceipt,
    setRelayer,
    stage,
    validationErrors,
    withdraw,
  } = useWithdraw({
    recipient,
    note: depositNote,
  });
  console.log(relayersState, 'relayersState');
  const feesGetter = useCallback(
    async (activeRelayer: ActiveWebbRelayer): Promise<FeesInfo> => {
      const defaultFees: FeesInfo = {
        totalFees: 0,
        withdrawFeePercentage: 0,
      };
      try {
        const fees = await activeRelayer.fees(note);
        return fees || defaultFees;
      } catch (e) {
        console.log(e);
      }
      return defaultFees;
    },
    [note]
  );

  const relayerApi: RelayerApiAdapter = useMemo(() => {
    return {
      getInfo: async (endpoint) => {
        return relayerMethods?.fetchCapabilities(endpoint) ?? ({} as any);
      },
      add(endPoint: string, _persistent: boolean) {
        return relayerMethods?.addRelayer(endPoint);
      },
    };
  }, [relayerMethods]);

  const disabledButton = useMemo(() => {
    console.log(depositNote, recipient);
    return !(depositNote && recipient);
    /*  if (depositNote && determineSwitchButton()) {
      return false;
    } else if (depositNote && recipient) {
      return false;
    }
    return true;*/
  }, [recipient, depositNote]);
  const determineSwitchButton = () => {
    return false;
    /*    if (depositNote && activeChain && activeChain.evmId != internalChainIdIntoEVMId(depositNote.note.chain)) {
      return true;
    }
    return false;*/
  };
  const switchChain = async (note: Note | null) => {
    if (!note) return;
    if (!activeApi) return;
    const newChainId = Number(note?.note.targetChainId);
    const chain = chainsPopulated[newChainId];

    const web3Provider = activeApi.getProvider();
    if (!web3Provider) {
      return;
    }
    await web3Provider
      .switchChain({
        chainId: `0x${chain.chainId?.toString(16)}`,
      })
      ?.catch(async (switchError: any) => {
        console.log('inside catch for switchChain', switchError);

        // cannot switch because network not recognized, so prompt to add it
        if (switchError.code === 4902) {
          const currency = currenciesConfig[chain.nativeCurrencyId];
          await web3Provider.addChain({
            chainId: `0x${chain.chainId?.toString(16)}`,
            chainName: chain.name,
            rpcUrls: chain.evmRpcUrls,
            nativeCurrency: {
              decimals: 18,
              name: currency.name,
              symbol: currency.symbol,
            },
          });
          // add network will prompt the switch, check evmId again and throw if user rejected
          const newChainId = await web3Provider.network;

          if (newChainId != chain.chainId) {
            throw switchError;
          }
        } else {
          throw switchError;
        }
      });
  };

  return (
    <WithdrawWrapper wallet={activeWallet}>
      <WithdrawNoteSection>
        <div className='titles-and-information'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant={'h6'}>
              <b>ADD NOTE</b>
            </Typography>
          </div>
          <RelayerSettings
            role='button'
            aria-disabled={!activeChain}
            onClick={() => {
              console.log('open relayer settings modal');
            }}
            className='select-button'
          >
            <SettingsIcon />
            <p style={{ fontSize: '14px', color: '#B6B6B6', marginLeft: '5px' }}>RELAYER</p>
          </RelayerSettings>
        </div>
        <div className='note-input'>
          <MixerNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
        </div>
      </WithdrawNoteSection>

      {depositNote && (
        <AddressAndInfoSection>
          <div style={{ padding: '10px 35px' }}>
            <Typography variant={'h6'}>
              <b>RECIPIENT ADDRESS</b>
            </Typography>
          </div>
          <div className='address-input'>
            <InputBase
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value as string);
              }}
              inputProps={{ style: { fontSize: 14 } }}
              fullWidth
              placeholder={`Please paste your address here`}
            />
            <FormHelperText error={Boolean(validationErrors.recipient && recipient)}>
              {validationErrors.recipient}
            </FormHelperText>
          </div>
          <SpaceBox height={16} />
          <div className='information-item'>
            <p className='title'>Deposit Amount</p>
            <p className='value'>
              {depositNote.note.amount} {depositNote.note.tokenSymbol}
            </p>
          </div>
          <div className='information-item'>
            <p className='title'>Chains</p>
            <p className='value'>{getChainNameFromChainId(parseChainIdType(Number(depositNote.note.sourceChainId)))}</p>
          </div>
          <div className='information-item'>
            <p className='title'>Relayer Fee</p>
            <p className='value'>{relayersState.activeRelayer ? feesGetter(relayersState.activeRelayer) : '0'}</p>
          </div>
          <SpaceBox height={4} />
          <div className='total-amount'>
            <p className='title'>Total Amount</p>
            <p className='value'>.1 webbWETH</p>
          </div>
          <SpaceBox height={8} />
          <div style={{ padding: '10px 35px' }}>
            <MixerButton
              disabled={disabledButton}
              onClick={determineSwitchButton() ? () => switchChain(depositNote) : withdraw}
              label={determineSwitchButton() ? 'Switch chains to withdraw' : 'Withdraw'}
            />
          </div>
          <SpaceBox height={16} />
        </AddressAndInfoSection>
      )}

      {/* Modal to show while in progress */}
      <Modal open={stage !== WithdrawState.Ideal}>
        {depositNote && (
          <WithdrawingModal
            withdrawTxInfo={{
              account: recipient,
            }}
            note={depositNote.note}
            cancel={cancelWithdraw}
            stage={stage}
            canCancel={canCancel}
          />
        )}
      </Modal>
      {/* Modal to show on success  */}
      <Modal open={receipt != ''}>
        {depositNote && (
          <WithdrawSuccessModal
            receipt={receipt}
            recipient={recipient}
            note={depositNote.note}
            relayer={relayersState.activeRelayer}
            exit={() => {
              setNote('');
              setRecipient('');
              setReceipt('');
              /// will reset the tx handler
              return cancelWithdraw();
            }}
          />
        )}
      </Modal>
    </WithdrawWrapper>
  );
};
