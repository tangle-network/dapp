import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { InputBase } from '@material-ui/core';
import { WalletTokenInput } from '@webb-dapp/ui-components/Inputs/WalletTokenInput/WalletTokenInput';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

const FaucetWrapper = styled.div``;
const FaucetContentWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
`;
type FaucetProps = {};

export type RelayerIpInfo = {
  ip: String;
};

export const Faucet: React.FC<FaucetProps> = () => {
  const { activeApi } = useWebContext();
  const [ip, setIp] = useState<RelayerIpInfo>({ ip: '' });
  const [linkInput, setLinkInput] = useState('');
  const [accountInput, setAccountInput] = useState('');

  useEffect(() => {
    async function getIpInfo() {
      const relayer = await activeApi?.relayingManager.getRelayer({})[0];
      if (relayer) {
        const response = await relayer.getIp();
        console.log(response);
        setIp(response);
      }
    }
    getIpInfo();
  }, [activeApi]);

  const receive = () => {

  }

  return (
    <FaucetWrapper>
      <FaucetContentWrapper>
        <WalletTokenInput setSelectedToken={(token) => {}} selectedToken={undefined} />
        <SpaceBox height={16} />
        <InputSection>
          <InputLabel label={'Link'}>
            <InputBase
              value={linkInput}
              onChange={(event) => {
                setLinkInput(event.target.value as string);
              }}
              inputProps={{ style: { fontSize: 14 } }}
              fullWidth
              placeholder={`Enter social link`}
            />
          </InputLabel>
        </InputSection>
        <SpaceBox height={16} />
        <InputSection>
          <InputLabel label={'Address'}>
            <InputBase
              value={accountInput}
              onChange={(event) => {
                setAccountInput(event.target.value as string);
              }}
              inputProps={{ style: { fontSize: 14 } }}
              fullWidth
              placeholder={`Enter account address to receive`}
            />
          </InputLabel>
        </InputSection>
        <SpaceBox height={16} />
        <MixerButton onClick={receive} label={'Receive'} />
      </FaucetContentWrapper>
      <SpaceBox height={8} />
      <IPDisplay ip={ip.ip} />
    </FaucetWrapper>
  );
};
