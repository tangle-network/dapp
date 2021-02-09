import { useAccounts } from '@webb-dapp/react-hooks';
import { Skeleton, styled } from '@webb-dapp/ui-components';
import React, { createRef, FC, useContext, useEffect } from 'react';
import { useMatch } from 'react-router-dom';

import { ReactComponent as WalletIcon } from '../assets/wallet.svg';
import { FormatAddress } from '../format';
import { SidebarActiveContext } from './context';
import { CNavLink } from './Products';

const Name = styled.p`
  width: 160px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: var(--color-primary);
`;

const Address = styled(({ address, className, name }) => {
  return (
    <div className={className}>
      <Name>{name}</Name>
      <FormatAddress address={address} />
    </div>
  );
})`
  display: ${({ collapse }): string => (collapse ? 'none' : 'block')};
  margin-left: 15px;
  color: #abb4d1;
`;

const CSkeleton = styled(Skeleton.Button)`
  span {
    width: 100% !important;
    height: 58px !important;
  }
`;

interface AccountProps {
  collapse: boolean;
}

export const Account: FC<AccountProps> = ({ collapse }) => {
  const { active } = useAccounts();
  const ref = createRef<HTMLAnchorElement>();
  const { active: activeDOM, setActive } = useContext(SidebarActiveContext);
  const isMatch = useMatch('wallet');

  useEffect(() => {
    if (!isMatch) return;

    if (!!isMatch && setActive && activeDOM !== ref.current) {
      setActive(ref.current);
    }
  }, [isMatch, setActive, ref, activeDOM]);

  if (!active) return <CSkeleton active />;

  return (
    <CNavLink $hasIcon={true} ref={ref} to={'wallet'}>
      <WalletIcon />
      <Address address={active?.address} collapse={collapse} name={active?.name} />
    </CNavLink>
  );
};
