import { MenuItem, Select, Step, StepLabel, Stepper } from '@material-ui/core';
import { Capabilities } from '@webb-dapp/react-environment';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';

export interface RelayerApiAdapter {
  getInfo(endpoing: string): Promise<Capabilities>;

  add(endPoint: string, persistent: boolean): void;
}

const RelayerInputWrapper = styled.div``;
type RelayerInputProps = {
  relayers: string[];
  activeRelayer?: string;
  setActiveRelayer(nextRelayer: string | undefined): void;

  relayerApi: RelayerApiAdapter;
};

enum RelayerInputStatus {
  SelectOfCurrent,
  AddURlkNewCustom,
  CheckNewCustom,
}

const RelayerInput: React.FC<RelayerInputProps> = ({ activeRelayer, relayer, relayerApi, setActiveRelayer }) => {
  const [view, setView] = useState<RelayerInputStatus>(RelayerInputStatus.SelectOfCurrent);
  const [customRelayURl, setCustomRelayURl] = useState('');
  const [persistentCustomRelay, setPersistentCustomRelay] = useState(false);
  const [checkRelayStatus, setCheckRelayStatus] = useState<{
    loading: boolean;
    capabilities?: Capabilities;
    url?: string;
    error?: string;
  }>({
    loading: false,
  });
  useEffect(() => {
    if (view === RelayerInputStatus.SelectOfCurrent) {
      setCustomRelayURl('');
      setCustomRelayURl(false);
    }
  }, [view]);

  const handleNewCustomRelayer = useCallback(async () => {
    await relayerApi.add(customRelayURl, persistentCustomRelay);
    setActiveRelayer(customRelayURl);
  }, [relayerApi, customRelayURl, persistentCustomRelay]);

  const fetchRelayInfo = useCallback(async () => {
    setCheckRelayStatus({
      loading: true,
    });
    try {
      const data = await relayerApi.getInfo(customRelayURl);
      setCheckRelayStatus({
        loading: false,
        url: customRelayURl,
        capabilities: data,
      });
    } catch (e) {
      setCheckRelayStatus({
        loading: false,
        error: 'failed to fetch info',
        url: customRelayURl,
      });
    }
  }, [relayerApi, customRelayURl]);
  return (
    <RelayerInputWrapper>
      <InputSection>
        <InputLabel label={'Relayer'}>
          <Select
            fullWidth
            value={activeRelayer || 'none'}
            onChange={async ({ target: { value } }) => {
              switch (value) {
                case 'none':
                  setActiveRelayer(null);
                  break;
                case 'custom':
                  setView(RelayerInputStatus.AddURlkNewCustom);
                  break;
                default:
                  setActiveRelayer(value);
              }
            }}
          >
            <MenuItem value={'none'} key={'none'}>
              <p style={{ fontSize: 14 }}>None</p>
            </MenuItem>
            <MenuItem value={'custom'} key={'Custom'}>
              <p style={{ fontSize: 14 }}>Custom</p>
            </MenuItem>
            {relayers.relayers.map((endpoint) => {
              return (
                <MenuItem value={endpoint} key={endpoint}>
                  <p style={{ fontSize: 14 }}>{relayer.endpoint}</p>
                </MenuItem>
              );
            })}
          </Select>
        </InputLabel>
      </InputSection>

      <Modal open={view > RelayerInputStatus.SelectOfCurrent}>
        <Stepper activeStep={view}>
          <Step key={RelayerInputStatus.AddURlkNewCustom}>
            <StepLabel>Add Url</StepLabel>
            Add url for the custom relayer
          </Step>
          <Step key={RelayerInputStatus.CheckNewCustom}>
            <StepLabel>Check the relayer info</StepLabel>
            Check the relayer info
          </Step>
        </Stepper>
      </Modal>
    </RelayerInputWrapper>
  );
};
export default RelayerInput;
