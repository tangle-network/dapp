import { FormHelperText, InputBase } from '@material-ui/core';
import { chainIdIntoEVMId, chainsPopulated, currenciesConfig } from '@webb-dapp/apps/configs';
import WithdrawingModal from '@webb-dapp/bridge/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/bridge/hooks';
import { useDepositNote } from '@webb-dapp/mixer';
import WithdrawSuccessModal from '@webb-dapp/react-components/Withdraw/WithdrawSuccessModal';
import { useWebContext, WithdrawState } from '@webb-dapp/react-environment';
import { ActiveWebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { BridgeNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/BridgeNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import RelayerInput, { FeesInfo, RelayerApiAdapter } from '@webb-dapp/ui-components/RelayerInput/RelayerInput';
import { Note } from '@webb-tools/sdk-mixer';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');
  const { activeApi, activeChain } = useWebContext();

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
    note,
  });
  console.log('relayerState', relayersState);
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
  const determineDisabled = () => {
    if (depositNote && determineSwitchButton()) {
      return false;
    } else if (depositNote && recipient) {
      return false;
    }
    return true;
  };
  const determineSwitchButton = () => {
    if (depositNote && activeChain && activeChain.evmId != chainIdIntoEVMId(depositNote.note.chain)) {
      return true;
    }
    return false;
  };
  const switchChain = async (note: Note | null) => {
    if (!note) return;
    if (!activeApi) return;
    const newChainId = Number(note.note.chain);
    const chain = chainsPopulated[newChainId];

    const web3Provider = activeApi.getProvider();

    await web3Provider
      .switchChain({
        chainId: `0x${chain.evmId?.toString(16)}`,
      })
      ?.catch(async (switchError: any) => {
        console.log('inside catch for switchChain', switchError);

        // cannot switch because network not recognized, so prompt to add it
        if (switchError.code === 4902) {
          const currency = currenciesConfig[chain.nativeCurrencyId];
          await web3Provider.addChain({
            chainId: `0x${chain.evmId?.toString(16)}`,
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

          if (newChainId != chain.evmId) {
            throw switchError;
          }
        } else {
          throw switchError;
        }
      });
  };

  const depositNote = useDepositNote(note);
  return (
    <WithdrawWrapper>
      <InputSection>
        <BridgeNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
      </InputSection>
      <SpaceBox height={16} />

      <InputSection>
        <InputLabel label={'Recipient'}>
          <InputBase
            value={recipient}
            onChange={(event) => {
              setRecipient(event.target.value as string);
            }}
            inputProps={{ style: { fontSize: 14 } }}
            fullWidth
            placeholder={`Enter account address`}
          />
          <FormHelperText error={Boolean(validationErrors.recipient && recipient)}>
            {validationErrors.recipient}
          </FormHelperText>
        </InputLabel>
      </InputSection>

      <SpaceBox height={16} />

      {depositNote && (
        <>
          <RelayerInput
            tokenSymbol={depositNote?.note.tokenSymbol || ''}
            feesGetter={feesGetter}
            relayers={relayersState.relayers}
            setActiveRelayer={setRelayer}
            relayerApi={relayerApi}
            activeRelayer={relayersState.activeRelayer}
          />
          <SpaceBox height={16} />
        </>
      )}

      <MixerButton
        disabled={determineDisabled()}
        onClick={determineSwitchButton() ? () => switchChain(depositNote) : withdraw}
        label={determineSwitchButton() ? 'Switch chains to withdraw' : 'Withdraw'}
      />
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
            exit={() => {
              setNote('');
              setRecipient('');
              setReceipt('');
            }}
          />
        )}
      </Modal>
    </WithdrawWrapper>
  );
};
