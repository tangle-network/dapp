import type {
  NotificationPayload,
  WebbApiProvider,
} from '@webb-tools/abstract-api-provider';
import {
  multipleKeypairStorageFactory,
  resetMultiAccountNoteStorage,
} from '@webb-tools/browser-utils/storage';
import type { WalletConfig } from '@webb-tools/dapp-config/wallets/wallet-config.interface';
import type { InteractiveFeedback } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons/Spinner';
import { NoteManager } from '@webb-tools/note-manager';
import { Keypair } from '@webb-tools/sdk-core';
import { notificationApi } from '@webb-tools/webb-ui-components/components/Notification/NotificationStacked';
import type { Maybe } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/Typography';
import { useObservableState } from 'observable-hooks';
import { useCallback, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

export const registerInteractiveFeedback = (
  setter: (update: (p: InteractiveFeedback[]) => InteractiveFeedback[]) => any,
  interactiveFeedback: InteractiveFeedback
) => {
  let off: any;
  setter((p) => [...p, interactiveFeedback]);
  // eslint-disable-next-line prefer-const
  off = interactiveFeedback.on('canceled', () => {
    setter((p) => p.filter((entry) => entry !== interactiveFeedback));
    off && off?.();
  });
};

export function notificationHandler(notification: NotificationPayload) {
  switch (notification.name) {
    case 'Transaction': {
      const isFailed = notification.level === 'error';
      const isFinalized = notification.level === 'success';
      const description = notification.data ? (
        <div>
          {Object.keys(notification.data).map((i, idx) => (
            <Typography variant="body1" key={`${i}${idx}`}>
              {notification.data?.[i]}
            </Typography>
          ))}
        </div>
      ) : (
        notification.description
      );
      if (isFinalized) {
        const key = notificationApi({
          extras: {
            persist: false,
          },
          message: notification.message ?? 'Submit Transaction Success',
          secondaryMessage: description,
          key: notification.key,
          variant: 'success',
        });
        setTimeout(() => notificationApi.remove(notification.key), 6000);
        return key;
      } else if (isFailed) {
        return notificationApi({
          extras: {
            persist: false,
          },
          key: notification.key,
          message: notification.message,
          secondaryMessage: description,
          variant: 'error',
        });
      } else {
        return notificationApi({
          extras: {
            persist: true,
          },
          key: notification.key,
          message: notification.message,
          secondaryMessage: description,
          variant: 'info',
          Icon: <Spinner />,
          transparent: true,
        });
      }
    }
    default:
      return '';
  }
}

notificationHandler.remove = (key: string | number) => {
  notificationApi.remove(key);
};

export function useNoteAccount<T>(activeApi: WebbApiProvider<T> | undefined) {
  const [noteManager, setNoteManager] = useState<NoteManager | null>(null);

  const loginNoteAccount = useCallback(
    async (key: string, walletAddress: string): Promise<NoteManager> => {
      // Set the keypair
      const accountKeypair = new Keypair(key);

      const multipleKeypairStorage = await multipleKeypairStorageFactory();
      multipleKeypairStorage.set(walletAddress, key);

      // create a NoteManager instance
      const noteManager = await NoteManager.initAndDecryptNotes(accountKeypair);

      // set the noteManager instance on the activeApi if it exists
      if (activeApi) {
        activeApi.noteManager = noteManager;
      }

      setNoteManager(noteManager);
      return noteManager;
    },
    [activeApi]
  );

  const logoutNoteAccount = useCallback(
    async (walletAddress: string) => {
      const multipleKeypairStorage = await multipleKeypairStorageFactory();
      multipleKeypairStorage.set(walletAddress, null);

      // clear the noteManager instance on the activeApi if it exists
      if (activeApi) {
        activeApi.noteManager = null;
      }
      setNoteManager(null);
    },
    [activeApi]
  );

  const purgeNoteAccount = useCallback(
    async (walletAddress: string) => {
      const multipleKeypairStorage = await multipleKeypairStorageFactory();
      const currentPrivKey = await multipleKeypairStorage.get(walletAddress);

      if (!currentPrivKey) {
        return;
      }

      resetMultiAccountNoteStorage(new Keypair(currentPrivKey).getPubKey());

      multipleKeypairStorage.set(walletAddress, null);

      // clear the noteManager instance on the activeApi if it exists
      if (activeApi) {
        activeApi.noteManager = null;
      }
      setNoteManager(null);
    },
    [activeApi]
  );

  const loginIfExist = useCallback(
    async (walletAddress: string) => {
      const multipleKeypairStorage = await multipleKeypairStorageFactory();
      const currentPrivKey = await multipleKeypairStorage.get(walletAddress);

      if (!currentPrivKey) {
        setNoteManager(null);
        return;
      }

      await loginNoteAccount(currentPrivKey, walletAddress);
    },
    [loginNoteAccount]
  );

  return {
    loginIfExist,
    loginNoteAccount,
    logoutNoteAccount,
    noteManager,
    purgeNoteAccount,
    setNoteManager,
  };
}

const activeWalletSubject = new BehaviorSubject<Maybe<WalletConfig>>(undefined);
const setActiveWallet = (wallet: Maybe<WalletConfig>) =>
  activeWalletSubject.next(wallet);

export function useActiveWallet() {
  const activeWallet = useObservableState(activeWalletSubject);
  return [activeWallet, setActiveWallet] as const;
}
