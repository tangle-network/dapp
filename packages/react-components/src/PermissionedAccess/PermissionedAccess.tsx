import { useFetch } from '@webb-dapp/react-hooks/useFetch';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Storage } from '@webb-dapp/utils';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Geofenced } from './Geofenced';

import { TermsAndConditions } from './TermsAndConditions';

const ContentWrapper = styled.div`
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
  maxHeight: '400px',
  overflow: 'auto',
`;

enum PermissionedState {
  Checking,
  Geofenced,
  AcceptTerms,
  Allowed,
}

type AcceptedTermsStore = {
  acceptedTerms?: boolean;
};
export type AcceptedTermsStorage = Storage<AcceptedTermsStore>;

export const acceptedTermsStorageFactory = () => {
  return Storage.newFromCache<AcceptedTermsStore>('acceptedTerms', {
    async commit(key: string, data: AcceptedTermsStore): Promise<void> {
      localStorage.setItem(key, JSON.stringify(data));
    },
    async fetch(key: string): Promise<AcceptedTermsStore> {
      const store: AcceptedTermsStore = {
        acceptedTerms: false,
      };
      const storageCached = localStorage.getItem(key);
      if (storageCached) {
        return {
          ...store,
          ...JSON.parse(storageCached),
        };
      }
      return store;
    },
  });
};

type PermissionedAccessProps = {
  ip: string;
};

export const PermissionedAccess: React.FC<PermissionedAccessProps> = ({ children, ip }) => {
  const [permissionedState, setPermissionedState] = useState<PermissionedState>(PermissionedState.Checking);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedTermsStorage, setAcceptedTermsStorage] = useState<AcceptedTermsStorage | null>(null);
  const { country_code_iso3 } = useFetch(`https://ipapi.co/${ip}/json`, {});

  const storeAcceptedTerms = () => {
    acceptedTermsStorage?.set('acceptedTerms', true);
    setAcceptedTerms(true);
  };

  useEffect(() => {
    const checkPermissions = async () => {
      if (!country_code_iso3) {
        setPermissionedState(PermissionedState.Checking);
        return;
      }
      if (country_code_iso3 === 'USA') {
        setPermissionedState(PermissionedState.Geofenced);
        return;
      }
      const acceptedTermsStorageItem = await acceptedTermsStorageFactory();
      setAcceptedTermsStorage(acceptedTermsStorageItem);
      const acceptedTermsStored = await acceptedTermsStorageItem.get('acceptedTerms');
      if (!acceptedTermsStored) {
        setPermissionedState(PermissionedState.AcceptTerms);
        return;
      }
      setPermissionedState(PermissionedState.Allowed);
    };
    checkPermissions();
  }, [country_code_iso3, acceptedTerms]);

  return (
    <>
      {permissionedState == PermissionedState.Checking && (
        <ContentWrapper>
          <Spinner />
        </ContentWrapper>
      )}
      {permissionedState == PermissionedState.Geofenced && (
        <div>
          <Geofenced />
        </div>
      )}
      {permissionedState == PermissionedState.AcceptTerms && (
        <div>
          <TermsAndConditions acceptTerms={storeAcceptedTerms} />
        </div>
      )}
      {permissionedState == PermissionedState.Allowed && <div>{children}</div>}
    </>
  );
};
