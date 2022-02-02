import { ButtonBase, Typography } from '@material-ui/core';
import { SpaceBox } from '@webb-dapp/ui-components';
import React, { memo } from 'react';
import styled, { css } from 'styled-components';

const POLKADOT_EXTENSION_PAGE = 'https://polkadot.js.org/extension';
const METAMASK_EXTENSION_PAGE = 'https://metamask.io/download';

const NoExtensionWrapper = styled.div`
  padding: 1rem;
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);
`;

const GetPolkadotButton = styled.button`
	&&& {
		width: 100%;
		background: ${({ theme }) => theme.warning};
		border-radius: 31px;
		color: #fff;
		height: 60px;
		font-weight: bold;
		transition: all ease-in-out .3s;

		${({ disabled, theme }) => {
      return disabled
        ? css`
            background: ${theme.gray4};
          `
        : '';
    }}
`;

const GetMetamaskButton = styled.button`
  &&& {
    width: 50%;
    background: ${({ theme }) => theme.warning};
    border-radius: 31px;
    color: #fff;
    height: 60px;
    font-weight: bold;
    transition: all ease-in-out .3s;

    ${({ disabled, theme }) => {
      return disabled
        ? css`
            background: ${theme.gray4};
          `
        : '';
    }}
`;

const handleOpenLink = (link: string): void => {
  window.open(link, '_blank');
};

export const NoExtensions: React.FC = memo(() => {
  return (
    <NoExtensionWrapper>
      <Typography color={'textPrimary'}>{'No web3 extensions found, please install one first!'}</Typography>
      <SpaceBox height={30} />
      <GetPolkadotButton as={ButtonBase} onClick={() => handleOpenLink(POLKADOT_EXTENSION_PAGE)}>
        {'Get Polkadot{.js}'}
      </GetPolkadotButton>
      {/* <GetMetamaskButton as={ButtonBase} 
        onClick={() => handleOpenLink(METAMASK_EXTENSION_PAGE)}>
          {'Get Metamask'}
      </GetMetamaskButton> */}
    </NoExtensionWrapper>
  );
});

NoExtensions.displayName = 'NoExtensions';
