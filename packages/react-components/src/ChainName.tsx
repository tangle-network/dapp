import React, { FC } from 'react';

import { useApi, useModal } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';
import { styled } from '@webb-dapp/ui-components';

import { ReactComponent as NetworkIcon } from './assets/network.svg';
import { ReactComponent as WebbIcon } from './assets/webb-logo-small.svg';
import { SelectNetwork } from './SelectNetwork';

interface ChainNameProps extends BareProps {
  collapse: boolean;
}

const ChainNameRoot = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CNetworkIcon = styled(NetworkIcon)`
  margin-right: 8px;
`;

const ChainIcon = styled(WebbIcon)`
  display: block;
  margin-right: 4.5px;
  width: 14px;
  height: 14px;
  border-radius: 100%;
  box-shadow: 0 0 4px rgba(23, 65, 212, 0.18);
`;

const ChainNameContent = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;

  background: var(--card-background);
  border: 1px solid rgba(23, 61, 201, 0.2);
  box-shadow: 0 0 4px 0 rgba(6, 35, 96, 0.06);
  border-radius: 11.5px;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 200ms ease-in;

  &:hover {
    background: var(--color-primary);
    color: var(--color-white);
  }
`;

export const ChainName: FC<ChainNameProps> = ({ className, collapse }) => {
  const { chainInfo } = useApi();
  const { close, open: openChainSelector, status } = useModal();

  return (
    <>
      <ChainNameRoot className={className} onClick={openChainSelector}>
        <>
          <CNetworkIcon />
          {collapse || !chainInfo.chainName ? null : (
            <ChainNameContent>
              <ChainIcon />
              {chainInfo.chainName}
            </ChainNameContent>
          )}
        </>
      </ChainNameRoot>
      <SelectNetwork onClose={close} visiable={status} />
    </>
  );
};
