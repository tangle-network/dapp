import { useIp } from '@webb-dapp/react-environment/';
import { useFetch } from '@webb-dapp/react-hooks/useFetch';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers';
import { Spinner } from '@webb-dapp/ui-components/Spinner/Spinner';
import { Storage } from '@webb-dapp/utils';
import React, { useEffect, useState } from 'react';

import { DisableAdblock } from './DisableAdblock';
import { Geofenced } from './Geofenced';
import { TermsAndConditions } from './TermsAndConditions';

enum PermissionedState {
  Adblocked,
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

type PermissionedAccessProps = {};

export const PermissionedAccess: React.FC<PermissionedAccessProps> = ({ children }) => {
  const [permissionedState, setPermissionedState] = useState<PermissionedState>(PermissionedState.Checking);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedTermsStorage, setAcceptedTermsStorage] = useState<AcceptedTermsStorage | null>(null);
  const { countryCode } = useIp();

  const storeAcceptedTerms = () => {
    acceptedTermsStorage?.set('acceptedTerms', true);
    setAcceptedTerms(true);
  };

  useEffect(() => {
    const checkPermissions = async () => {
      if (!countryCode) {
        setPermissionedState(PermissionedState.Checking);
        return;
      }
      if (countryCode === 'unknown') {
        setPermissionedState(PermissionedState.Adblocked);
        return;
      }
      if (countryCode === 'USA') {
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
  }, [countryCode]);

  return (
    <>
      {permissionedState == PermissionedState.Adblocked && (
        <div>
          <DisableAdblock />
        </div>
      )}
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
