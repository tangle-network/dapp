import { Typography } from '@mui/material';
import { ActiveWebbRelayer, RelayersState, WebbRelayer } from '@nepoche/abstract-api-provider';
import { useWebContext } from '@nepoche/api-provider-environment';
import { getRelayerManagerFactory } from '@nepoche/relayer-manager-factory';
import { SpaceBox } from '@nepoche/ui-components/Box';
import { CloseButton } from '@nepoche/ui-components/Buttons/CloseButton';
import { FeesInfo, RelayerApiAdapter, RelayerInput } from '@nepoche/react-components/RelayerInput/RelayerInput';
import { FontFamilies } from '@nepoche/styled-components-theme';
import { Note } from '@webb-tools/sdk-core';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

const RelayerModalWrapper = styled.div`
  width: 500px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.layer2Background};

  .modal-header {
    position: relative;
    width: 100%;
  }

  .withdraw-modal-header {
    padding-top: 1rem;
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: medium;
  }

  .withdraw-modal-header-complete {
    font-family: ${FontFamilies.AvenirNext};
    text-align: center;
    font-weight: medium;
  }
`;

type RelayerModalProps = {
  note: Note | null;
  state: RelayersState;
  onChange: (nextRelayer: WebbRelayer | null) => void;
  onClose: () => void;
};

export const RelayerModal: React.FC<RelayerModalProps> = ({ note, onChange, onClose, state }) => {
  const { activeApi } = useWebContext();

  const feesGetter = useCallback(
    async (activeRelayer: ActiveWebbRelayer): Promise<FeesInfo> => {
      const defaultFees: FeesInfo = {
        totalFees: 0,
        withdrawFeePercentage: 0,
      };
      try {
        const fees = await activeRelayer.fees(note!.serialize());
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
        const relayerManagerFactory = await getRelayerManagerFactory();
        return relayerManagerFactory.fetchCapabilities(endpoint) ?? ({} as any);
      },
      add: async (endPoint: string) => {
        const relayerManagerFactory = await getRelayerManagerFactory();
        const relayerCapabilities = await relayerManagerFactory.addRelayer(endPoint);
        const relayer = new WebbRelayer(endPoint, relayerCapabilities[endPoint]);
        activeApi?.relayerManager.addRelayer(relayer);
        return relayer;
      },
    };
  }, [activeApi]);

  return (
    <RelayerModalWrapper>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
        <Typography variant='h2'>Relayer Configuration</Typography>
        <CloseButton onClick={onClose} />
      </div>
      <SpaceBox height={40} />
      {note ? (
        <>
          <div>
            <Typography variant='h4'>Relayer</Typography>
          </div>
          <SpaceBox height={16} />
          <div style={{ display: 'flex', width: '100%' }}>
            <RelayerInput
              relayers={state.relayers}
              activeRelayer={state.activeRelayer}
              relayerApi={relayerApi}
              setActiveRelayer={onChange}
              tokenSymbol={note?.note.tokenSymbol || ''}
              feesGetter={feesGetter}
              wrapperStyles={{ width: '100%' }}
            />
          </div>
        </>
      ) : (
        <div>
          <Typography variant={'h4'}>Enter a note to configure the relayer</Typography>
        </div>
      )}
    </RelayerModalWrapper>
  );
};
