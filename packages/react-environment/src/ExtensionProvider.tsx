import React, { ReactNode, createContext, FC, useCallback, useEffect, useState, useReducer, useMemo } from 'react';
import { isNumber } from 'lodash';
import { InjectedAccount, InjectedExtension, MetadataDef } from '@polkadot/extension-inject/types';
import { ApiRx } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { options } from '@acala-network/api';

import { NoAccounts, NoExtensions, SelectAccount, UploadMetadata } from '@webb-dapp/react-components';
import { useModal, useApi, useStorage } from '@webb-dapp/react-hooks';

type AddressBook = {
  address: string;
  name?: string;
}[];

export interface ExtensionData {
  isReady: boolean;
  accounts?: InjectedAccount[];
  authRequired: boolean;
  active?: InjectedAccount;
  openSelectAccount: () => void;
  closeSelectAccount: () => void;
  selectAccountStatus: boolean;
  addressBook: AddressBook;
  addToAddressBook: (data: { address: string; name?: string }) => void;
}

export const ExtensionContext = createContext<ExtensionData>({} as any);

async function getExtensions(api: ApiRx, appName: string): Promise<InjectedExtension> {
  const extensions = await web3Enable(appName);

  if (extensions.length === 0) throw new Error('no_extensions');

  const currentExtensions = extensions[0];

  return currentExtensions;
}

interface AccountProviderProps {
  appName: string;
  authRequired?: boolean;
}

export const ExtensionProvider: FC<AccountProviderProps> = ({ appName, authRequired = true, children }) => {
  const { api } = useApi();
  const [isReady, setIsReady] = useState<boolean>(authRequired || false);
  const [active, setActive] = useState<InjectedAccount | undefined>();
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [addressBook, setAddressBook] = useState<AddressBook>([]);
  const [extension, setExtension] = useState<InjectedExtension | undefined>();
  const [triggerSignal, triggerUpdate] = useReducer((c) => c + 1, 0);
  const { getStorage, setStorage } = useStorage({ useAccountPrefix: false });

  // select account modal status and action
  const { close: closeSelectAccount, open: openSelectAccount, status: selectAccountStatus } = useModal(false);

  // upload metadata modal
  const { close: closeUploadMatedata, open: openUploadMatedata, status: uploadMatedataStatus } = useModal(false);
  const [metadataDef, setMetadataDef] = useState<MetadataDef | undefined>();
  const [errorStatus, setErrorStatus] = useState<{
    noExtension?: boolean;
    noAccount?: boolean;
  }>({ noAccount: false, noExtension: false });

  const checkIfNeedUploadMetadata = useCallback(async () => {
    if (!extension) return;
    if (!api.isConnected) return;

    const known = await extension?.metadata?.get();
    const metadataDef = {
      chain: (api as any)._runtimeChain.toString(),
      genesisHash: api.genesisHash.toHex(),
      icon: 'substrate',
      metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString('base64'),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      ss58Format: isNumber(api.registry.chainSS58) ? api.registry.chainSS58 : 42,
      tokenDecimals: isNumber(api.registry.chainDecimals) ? api.registry.chainDecimals : 12,
      tokenSymbol: api.registry.chainToken || 'Unit',
      types: options({}).types as any
    };

    setMetadataDef(metadataDef);

    if (!known || !metadataDef) return false;

    const result = !known.find(({ genesisHash, specVersion }) => {
      return metadataDef.genesisHash === genesisHash && metadataDef.specVersion === specVersion;
    });

    if (result) openUploadMatedata();
  }, [api, extension, openUploadMatedata]);

  const setActiveAccount = useCallback(
    async (address: string | InjectedAccount): Promise<void> => {
      if (!api || !address || !extension || !accounts.length) return;

      // extract address
      address = typeof address === 'string' ? address : address.address;

      try {
        const account = accounts.find((item) => item.address === address);
        const injector = await web3FromAddress(address);

        if (account) {
          api.setSigner(injector.signer);
          setIsReady(true);
          setActive(account);
          setStorage(`${appName}_active_account`, address);
          closeSelectAccount();
        } else {
          throw new Error('could not found the address in the extension');
        }
      } catch (e) {
        setIsReady(false);
      }
    },
    [api, appName, setIsReady, setStorage, extension, accounts, closeSelectAccount]
  );

  const addToAddressBook = useCallback(
    (data: { address: string; name?: string }) => {
      const newAddressbook = [...addressBook, data].reduce((acc, cur) => {
        if (acc.find((item) => item.address === cur.address)) return acc;

        return [...acc, cur];
      }, [] as AddressBook);

      setAddressBook(newAddressbook);
      setStorage(`${appName}_address_book`, JSON.stringify(newAddressbook));
    },
    [addressBook, setAddressBook, setStorage, appName]
  );

  const uploadMetadata = useCallback(async () => {
    if (!extension) return;

    if (!metadataDef) return;

    await extension.metadata?.provide(metadataDef);

    closeUploadMatedata();
    triggerUpdate();
  }, [extension, metadataDef, closeUploadMatedata]);

  const renderError = useCallback((): ReactNode => {
    if (!authRequired) return null;

    if (errorStatus.noAccount) {
      return <NoAccounts />;
    }

    if (errorStatus.noExtension) {
      return <NoExtensions />;
    }

    return null;
  }, [authRequired, errorStatus]);

  // get web3 extension
  useEffect(() => {
    if (!api.isConnected) return;

    getExtensions(api, appName)
      .then((extension) => {
        setExtension(extension);
      })
      .catch(() => {
        setErrorStatus({ noExtension: true });
      });
  }, [api, triggerSignal, setExtension, setErrorStatus, appName]);

  // check if need upload metadata and subscribe accounts
  useEffect(() => {
    if (!extension) return;

    const unsubscribe = extension?.accounts.subscribe((accounts) => {
      // check if no account
      setErrorStatus({ noAccount: accounts.length === 0 });

      setAccounts(accounts);
    });

    checkIfNeedUploadMetadata();

    return (): void => {
      unsubscribe && unsubscribe();
    };
  }, [extension, setAccounts, checkIfNeedUploadMetadata, setErrorStatus]);

  // load active account
  useEffect(() => {
    if (!accounts.length) return;
    if (!api) return;

    const saved = getStorage(`${appName}_active_account`);

    // check if saved account is available in accounts
    const isSavedAccountAvailable = !!accounts.find((item) => item.address === saved);

    if (saved && isSavedAccountAvailable) {
      setActiveAccount(saved);

      return;
    }

    if (accounts.length === 1) {
      setActiveAccount(accounts[0].address);

      return;
    }

    openSelectAccount();
  }, [api, accounts, appName, openSelectAccount, setActiveAccount, getStorage]);

  // load address book
  useEffect(() => {
    const saved = getStorage(`${appName}_address_book`);

    try {
      const _saved = (JSON.parse(saved ?? '[]') as unknown) as AddressBook;
      const newAddressbook = [...accounts, ..._saved, ...addressBook].reduce((acc, cur) => {
        if (acc.find((item) => item.address === cur.address)) return acc;

        return [...acc, cur];
      }, [] as AddressBook);

      setAddressBook(newAddressbook);
    } catch (e) {
      // ingore error
    }
    // addressbook change doesn't trigger this effect
    /* eslint-disable-next-line */
  }, [accounts, setAddressBook, getStorage, appName]);

  const data = useMemo(
    () => ({
      accounts,
      active,
      addToAddressBook,
      addressBook,
      authRequired,
      closeSelectAccount,
      isReady,
      openSelectAccount,
      selectAccountStatus
    }),
    [
      accounts,
      active,
      isReady,
      authRequired,
      openSelectAccount,
      closeSelectAccount,
      addressBook,
      addToAddressBook,
      selectAccountStatus
    ]
  );

  return (
    <ExtensionContext.Provider value={data}>
      <SelectAccount
        accounts={accounts}
        defaultAccount={active ? active.address : undefined}
        onCancel={closeSelectAccount}
        onSelect={setActiveAccount}
        visable={selectAccountStatus}
      />
      <UploadMetadata close={closeUploadMatedata} uploadMetadata={uploadMetadata} visiable={uploadMatedataStatus} />
      {children}
      {renderError()}
    </ExtensionContext.Provider>
  );
};
