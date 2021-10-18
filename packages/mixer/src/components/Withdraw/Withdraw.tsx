import { FormHelperText, InputBase } from '@material-ui/core';
import WithdrawingModal from '@webb-dapp/mixer/components/Withdraw/WithdrawingModal';
import { useWithdraw } from '@webb-dapp/mixer/hooks';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import WithdrawSuccessModal from '@webb-dapp/react-components/Withdraw/WithdrawSuccessModal';
import { WithdrawState } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { MixerNoteInput } from '@webb-dapp/ui-components/Inputs/NoteInput/MixerNoteInput';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import RelayerInput, { RelayerApiAdapter } from '@webb-dapp/ui-components/RelayerInput/RelayerInput';

const WithdrawWrapper = styled.div``;
type WithdrawProps = {};

export const Withdraw: React.FC<WithdrawProps> = () => {
  const [note, setNote] = useState('');

  const [recipient, setRecipient] = useState('');
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);
  const [fees, setFees] = useState('');

  const {
    canCancel,
    cancelWithdraw,
    receipt,
    relayersState,
    setReceipt,
    setRelayer,
    stage,
    validationErrors,
    withdraw,
    relayerMethods,
  } = useWithdraw({
    recipient,
    note,
  });

  useEffect(() => {
    async function getFees() {
      try {
        if (!relayersState.activeRelayer) {
          return;
        }
        relayersState.activeRelayer.fees(note).then((fees) => {
          if (!fees) {
            return;
          }
          setFees(fees.totalFees);
          setWithdrawPercentage(fees.withdrawFeePercentage);
        });
      } catch (e) {
        return;
      }
    }

    getFees();
  }, [note, relayersState.activeRelayer]);

  const relayerApi: RelayerApiAdapter = useMemo(() => {
    return {
      getInfo: (endpoint) => {
        return relayerMethods?.fetchCapabilities(endpoint);
      },
      add(endPoint: string, _persistent: boolean) {
        return relayerMethods?.addRelayer(endPoint);
      },
    };
  }, [relayerMethods]);

  const depositNote = useDepositNote(note);
  return (
    <WithdrawWrapper>
      <InputSection>
        <MixerNoteInput error={note ? validationErrors.note : ''} value={note} onChange={setNote} />
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
            relayers={relayersState.relayers}
            setActiveRelayer={setRelayer}
            relayerApi={relayerApi}
            activeRelayer={relayersState.activeRelayer}
          />
          <SpaceBox height={16} />
        </>
      )}

      <MixerButton disabled={!recipient} onClick={withdraw} label={'Withdraw'} />

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
{
  /*              <Fade in={Boolean(relayersState.activeRelayer)} unmountOnExit mountOnEnter timeout={300}>
								<div
									style={{
										padding: 10,
									}}
								>
									<table
										style={{
											width: '100%',
										}}
									>
										<tbody>
											<tr>
												<td>
													<span style={{ whiteSpace: 'nowrap' }}>Withdraw fee percentage</span>
												</td>
												<td style={{ textAlign: 'right' }}>{withdrawPercentage * 100}%</td>
											</tr>

											{fees && (
												<tr>
													<td>Full fees</td>
													<td style={{ textAlign: 'right' }}>
														{ethers.utils.formatUnits(fees)} {depositNote && depositNote.note.tokenSymbol}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</Fade>*/
}
