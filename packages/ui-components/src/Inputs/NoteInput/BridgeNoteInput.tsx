import { FormHelperText, Icon, InputBase } from '@material-ui/core';
import {
  getEVMChainName,
  getEVMChainNameFromInternal,
  typeAndIdFromChainIdType,
  webbCurrencyIdFromString,
} from '@webb-dapp/apps/configs';
import { useBridge } from '@webb-dapp/bridge/hooks/bridge/use-bridge';
import { useDepositNote } from '@webb-dapp/mixer/hooks/note';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';

type NoteInputProps = {
  value: string;
  onChange(next: string): void;
  error?: string;
};
const NoteDetails = styled.div`
  ${({ theme }: { theme: Pallet }) => css`
    border-top: 2px solid ${theme.borderColor2};
  `};
  padding: 11px;
  margin: 0 -11px;
`;

export const BridgeNoteInput: React.FC<NoteInputProps> = ({ error, onChange, value }) => {
  const depositNote = useDepositNote(value);
  const { bridgeApi } = useBridge();
  const navigate = useNavigate();

  // Switch to mixer tab if note is for mixer
  useEffect(() => {
    if (depositNote && depositNote.note.protocol === 'mixer') {
      notificationApi.addToQueue({
        secondaryMessage: 'Please complete withdraw through the mixer',
        message: 'Switched to mixer',
        variant: 'warning',
        Icon: <Icon>report_problem</Icon>,
      });
      navigate('/mixer', { replace: true });
    }
  }, [depositNote, navigate]);

  const currency = useMemo(() => {
    try {
      if (depositNote && (depositNote.note.protocol == 'anchor')) {
        return bridgeApi?.currency;
      }
    } catch (_) {
      return null;
    }
  }, [depositNote, bridgeApi]);

  return (
    <InputLabel label={'Note'}>
      <InputBase
        fullWidth
        placeholder={`webb.bridge:v1:4:4:Circom:Bn254:Poseidon:ETH:18:0.1:5:5:dc92b0096b02746362c56dbee8e28a036f29b600b59cad3e4a114af2e2eb094f9878beaf5699f43d789937130e7ee7ca12e0703ce9cc62297bbb0abc864e`}
        multiline={true}
        rows={5}
        value={value}
        inputProps={{ style: { fontSize: 14 } }}
        onChange={(event) => {
          onChange?.(event.target.value as string);
        }}
      />
      {depositNote && (
        <NoteDetails>
          <table
            style={{
              width: '100%',
            }}
          >
            <tbody>
              <tr>
                <td>Context:</td>
                <td style={{ textAlign: 'right' }}>
                  <b>{depositNote.note.protocol.toUpperCase()}</b>
                </td>
              </tr>
              <tr>
                <td>Amount:</td>
                <td style={{ textAlign: 'right' }}>
                  {depositNote.note.amount} <b>{depositNote.note.tokenSymbol}</b>
                </td>
              </tr>

              <tr>
                <td>Source Chain:</td>
                <td style={{ textAlign: 'right' }}>
                  {getEVMChainName(typeAndIdFromChainIdType(Number(depositNote.note.sourceChainId)).chainId)}
                </td>
              </tr>

              <tr>
                <td>Destination Chain:</td>
                <td style={{ textAlign: 'right' }}>
                  {getEVMChainName(typeAndIdFromChainIdType(Number(depositNote.note.targetChainId)).chainId)}
                </td>
              </tr>

              {currency ? (
                <>
                  <tr>
                    <td
                      style={{
                        verticalAlign: 'baseline',
                      }}
                    >
                      Bridge chains:
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div>
                        {currency
                          .getChainIds()
                          .map(getEVMChainNameFromInternal)
                          .map((chainName) => (
                            <div key={`${chainName}-bridge-chain`}> {chainName}</div>
                          ))}
                      </div>
                    </td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </table>
        </NoteDetails>
      )}
      <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
    </InputLabel>
  );
};
