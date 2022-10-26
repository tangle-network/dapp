import { ButtonBase, CircularProgress, Icon, Typography } from '@mui/material';
import { Pallet, useColorPallet } from '@nepoche/styled-components-theme';
import { useMemo } from 'react';
import styled, { css } from 'styled-components';

import { ArrowDownIcon } from '../assets/ArrowDownIcon';
import { Flex } from '../Flex/Flex';
import { above, useBreakpoint } from '@nepoche/responsive-utils';

type ConnectingState = 'connecting' | 'connected' | 'no-connection' | 'error';

export const NetworkIndicatorWrapper = styled.button`
  && {
    min-height: 40px;
    border-radius: 8px;
    padding: 4px;
    background: ${({ theme }: { theme: Pallet }) => theme.lightSelectionBackground};
    position: relative;
    width: 108px;
    margin-right: 8px;

    ${({ theme }) =>
      theme.type === 'dark'
        ? css`
            border: 1px solid ${theme.borderColor2};
          `
        : css``}

    ${above.xs`
      margin-right: 0.5rem;
      width: 132px;
    `}

    ${above.md`
      width: 148px; 
    `}
  }

  cursor: pointer;

  .avatar {
    width: 28px;
    height: 28px;
    background: transparent;

    ${above.xs`
      width: 32px;
      height: 32px;
    `}
  }
`;

export const DownIconWrapper = styled(Flex).attrs({
  row: true,
  jc: 'center',
  ai: 'center',
})`
  padding-right: 4px;
`;

export type NetworkManagerIndicatorProps = {
  connectionStatus: ConnectingState;
  connectionMetaData?: {
    hoverMessage?: string;
    chainName: string;
    details?: string;
    chainIcon: string | JSX.Element;
    tag?: string;
  };
  onClick?: (e: any) => void;
};

export const NetworkManagerIndicator: React.FC<NetworkManagerIndicatorProps> = ({
  connectionMetaData,
  connectionStatus,
  onClick,
}) => {
  const { isMdOrAbove, isXsOrAbove } = useBreakpoint();
  const pallet = useColorPallet();

  const icon = useMemo(() => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <Flex
            ai={'center'}
            jc={'center'}
            style={{
              width: 40,
              height: 40,
              marginRight: '4px',
              position: 'relative',
            }}
          >
            <Icon style={{ position: 'absolute', color: pallet.primaryText }} fontSize='medium'>
              podcasts
            </Icon>
            <CircularProgress style={{ position: 'absolute' }} size={isXsOrAbove ? 32 : 26.5} />
          </Flex>
        );

      case 'no-connection':
        return (
          <div>
            <Typography variant='subtitle1'>Select a Network</Typography>
          </div>
        );

      case 'error':
        return (
          <div>
            <Icon style={{ color: pallet.primaryText }} fontSize={isXsOrAbove ? 'large' : 'medium'}>
              podcasts
            </Icon>
          </div>
        );

      case 'connected':
      default:
        return connectionMetaData?.chainIcon ? (
          <div style={{ marginRight: '4px', border: `1px solid ${pallet.borderColor}`, borderRadius: '50%' }}>
            {connectionMetaData?.chainIcon}
          </div>
        ) : (
          <Icon style={{ color: pallet.primaryText }} fontSize={isXsOrAbove ? 'large' : 'medium'}>
            podcasts
          </Icon>
        );
    }
  }, [connectionMetaData, connectionStatus, isXsOrAbove, pallet]);

  return (
    <NetworkIndicatorWrapper as={ButtonBase} onClick={onClick}>
      <Flex flex={1} row ai='center' jc='center' style={{ width: '100%' }}>
        <Flex>{icon}</Flex>

        {connectionMetaData ? (
          <Flex row jc='space-between' ai='center' flex={1}>
            <Typography
              variant='subtitle1'
              style={{ maxWidth: '64px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              <b>{connectionMetaData.chainName}</b>
            </Typography>

            {isMdOrAbove && (
              <DownIconWrapper>
                <ArrowDownIcon />
              </DownIconWrapper>
            )}
          </Flex>
        ) : (
          ''
        )}
      </Flex>
    </NetworkIndicatorWrapper>
  );
};
