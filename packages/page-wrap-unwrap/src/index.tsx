import React, { FC, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Button, IconButton, InputBase, Tooltip } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import { hot } from 'react-hot-loader/root';
import { TokenInput } from '@webb-dapp/ui-components/Inputs/TokenInput/TokenInput';
import { SpaceBox } from '@webb-dapp/ui-components';
import Typography from '@material-ui/core/Typography';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useWebContext } from '@webb-dapp/react-environment';
import { RelayerIpInfo } from '@webb-dapp/mixer/Mixer';
import { useIp } from '@webb-dapp/react-hooks/useIP';

const TransferWrapper = styled.div`
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
const AmountInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const AmountButton = styled.button`
  && {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate3d(0, -50%, 0);
  }
`;

const PageWrappUnwrap: FC = () => {
  const [isSwap, setIsSwap] = useState(false);
  const [status, setStatus] = useState<'wrap' | 'unwrap'>('wrap');

  const { activeApi } = useWebContext();
  const ip = useIp(activeApi);
  return (
    <div>
      <TransferWrapper>
        <InputSection>
          <InputLabel label={'Transfer Token'} />
          <SpaceBox height={5} />
          <Flex
            row
            ai={'center'}
            flex={1}
            style={{
              position: 'relative',
            }}
          >
            <Flex flex={2}>
              <TokenInput wrapperStyles={{ top: -25 }} currencies={[]} onChange={() => {}} />
            </Flex>
            <Flex flex={1} row ai={'center'} jc={'center'}>
              <span>
                <Tooltip title={'Swap tokens'}>
                  <IconButton
                    onMouseEnter={() => {
                      setIsSwap(true);
                    }}
                    onMouseLeave={() => {
                      setIsSwap(false);
                    }}
                  >
                    <Icon>{isSwap ? 'swap_horiz' : 'east'}</Icon>
                  </IconButton>
                </Tooltip>
              </span>
            </Flex>
            <Flex flex={2}>
              <TokenInput wrapperStyles={{ top: -25 }} currencies={[]} onChange={() => {}} />
            </Flex>
          </Flex>
        </InputSection>

        <SpaceBox height={16} />

        <InputSection>
          <InputLabel label={'Transfer amount'} />
          <AmountInputWrapper>
            <InputBase fullWidth placeholder={'Enter amount'} />
            <AmountButton color={'primary'} as={Button}>
              MAX
            </AmountButton>
          </AmountInputWrapper>
        </InputSection>

        <SpaceBox height={16} />

        <MixerButton label={'Transfer'} onClick={() => {}} />
      </TransferWrapper>

      <SpaceBox height={8} />

      <IPDisplay ip={ip.ip} />
    </div>
  );
};

export default PageWrappUnwrap;
