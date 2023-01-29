import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { Account } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { downloadString } from '@webb-tools/browser-utils';
import { ManagedWallet, WalletConfig } from '@webb-tools/dapp-config';
import {
  ExternalLinkLine,
  LoginBoxLineIcon,
  ThreeDotsVerticalIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useNoteAccount, useWallets } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  KeyValueWithButton,
  MenuItem,
  shortenString,
  Typography,
  useWebbUI,
  IconWithTooltip,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { ClearDataModal } from './ClearDataModal';
import { HeaderButton } from './HeaderButton';

export const WalletButton: FC<{ account: Account; wallet: WalletConfig }> = ({
  account,
  wallet,
}) => {
  // Clear data modal
  const [isOpen, setIsOpen] = useState(false);

  const { activeChain, noteManager, purgeNoteAccount, inactivateApi } =
    useWebContext();

  // Get all note, syncNotes and isSyncingNote function
  const {
    allNotes,
    isSyncingNote,
    syncNotes: handleSyncNotes,
  } = useNoteAccount();

  const { setMainComponent, notificationApi, logger } = useWebbUI();

  // Get all managed wallets
  const { wallets } = useWallets();

  const currentManagedWallet = useMemo<ManagedWallet | undefined>(() => {
    return wallets.find((w) => w.connected);
  }, [wallets]);

  const noteSize = useMemo(
    () =>
      Array.from(allNotes.values()).reduce((acc, curr) => acc + curr.length, 0),
    [allNotes]
  );

  const displayText = useMemo(() => {
    if (account.name) {
      return account.name;
    }

    // if account address starts with 0x, then truncate it to xxxx...xxxx
    if (account.address.toLowerCase().startsWith('0x')) {
      return shortenString(account.address.substring(2), 4);
    }

    return shortenString(account.address, 4);
  }, [account]);

  // Get the note account keypair to display public + encryption key
  const keyPair = useMemo(() => noteManager?.getKeypair(), [noteManager]);

  // Calculate the account explorer url
  const accountExplorerUrl = useMemo(() => {
    if (!activeChain?.blockExplorerStub) return '#';

    const uri = activeChain.blockExplorerStub.endsWith('/')
      ? `address/${account.address}`
      : `/address/${account.address}`;

    return `${activeChain.blockExplorerStub}${uri}`;
  }, [activeChain, account]);

  // Clear data function
  const handleClearData = useCallback(async () => {
    if (!noteManager) {
      notificationApi({
        variant: 'error',
        message: 'Note manager is not initialized',
      });
      return;
    }

    // Clear all notes
    try {
      await noteManager.removeAllNotes();

      notificationApi({
        variant: 'success',
        message: 'All notes are cleared',
      });
    } catch (error) {
      logger.error('Error inside clear data', error);
      notificationApi({
        variant: 'error',
        message: 'Failed to clear notes',
      });
    }
  }, [logger, noteManager, notificationApi]);

  // Save backups function
  const handleSaveBackups = useCallback(async () => {
    if (!allNotes.size) {
      notificationApi({
        variant: 'error',
        message: 'No notes to backup',
      });
      return;
    }

    // Serialize all notes to array of string
    const notes = Array.from(allNotes.values()).reduce((acc, curr) => {
      curr.forEach((note) => {
        acc.push(note.serialize());
      });
      return acc;
    }, [] as string[]);

    // Download the notes as a file
    downloadString(JSON.stringify(notes), `notes-${Date.now()}.json`, '.json');
  }, [allNotes, notificationApi]);

  // TODO: Implement a function when user click on the new notes link
  // on the notification
  const handleNewNotes = useCallback(
    async (notes: Note[]) => {
      logger.info('Handle new notes: ', notes);
      logger.warn('New notes function is not implemented yet');
    },
    [logger]
  );

  // Funciton to switch account within the connected wallet
  const handleSwitchAccount = useCallback(async () => {
    if (!activeChain) {
      notificationApi({
        variant: 'error',
        message: 'No active chain',
      });
      return;
    }

    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined'
    ) {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [activeChain, notificationApi]);

  // Disconnect function
  // TODO: The disconnect function does not work properly
  const handleDisconnect = useCallback(async () => {
    if (currentManagedWallet && currentManagedWallet.canEndSession) {
      currentManagedWallet.endSession();
    }

    await purgeNoteAccount();

    await inactivateApi();

    setMainComponent(undefined);
  }, [currentManagedWallet, purgeNoteAccount, inactivateApi, setMainComponent]);

  return (
    <>
      <Dropdown>
        <DropdownTrigger asChild>
          <HeaderButton className="rounded-full">
            {wallet.Logo}

            <Typography variant="body1" fw="bold">
              {displayText}
            </Typography>
          </HeaderButton>
        </DropdownTrigger>

        <DropdownBody className="mt-6 w-[480px] p-4 space-y-4 dark:bg-mono-160">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {wallet.Logo}

              <div>
                <Typography variant="h5" fw="bold" className="capitalize">
                  {account.name || wallet.name}
                </Typography>

                <div className="flex items-center space-x-1">
                  <KeyValueWithButton
                    className="mt-0.5"
                    isHiddenLabel
                    keyValue={account.address}
                    size="sm"
                    labelVariant="body1"
                    valueVariant="body1"
                  />

                  <a href={accountExplorerUrl} target="_blank" rel="noreferrer">
                    <ExternalLinkLine />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2.5">
              <Button
                onClick={handleSwitchAccount}
                leftIcon={
                  <WalletLineIcon className="!fill-current" size="lg" />
                }
                variant="link"
              >
                Switch
              </Button>

              <Button
                onClick={handleDisconnect}
                leftIcon={
                  <LoginBoxLineIcon className="!fill-current" size="lg" />
                }
                variant="link"
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rounded-lg py-4 pl-2 pr-2.5 hover:bg-mono-20 hover:dark:bg-mono-170">
              {keyPair && (
                <>
                  <IconWithTooltip
                    icon={
                      <Avatar value={keyPair.toString()} theme="ethereum" />
                    }
                    content="Note account"
                  />

                  <KeyValueWithButton
                    className="mt-0.5"
                    label="Public Key:"
                    keyValue={keyPair.toString()}
                    size="sm"
                    labelVariant="body1"
                    valueVariant="body1"
                  />
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                isLoading={isSyncingNote}
                onClick={() => handleSyncNotes(handleNewNotes, handleSyncNotes)}
                variant="utility"
              >
                Sync Notes
              </Button>

              <Dropdown>
                <DropdownBasicButton className="pt-2">
                  <ThreeDotsVerticalIcon size="lg" />
                </DropdownBasicButton>
                <DropdownBody>
                  <MenuItem onClick={() => setIsOpen(true)}>
                    Clear data
                  </MenuItem>
                </DropdownBody>
              </Dropdown>
            </div>
          </div>
        </DropdownBody>
      </Dropdown>
      <ClearDataModal
        noteSize={noteSize}
        onSaveBackups={handleSaveBackups}
        onClearData={handleClearData}
        isOpen={isOpen}
        setIsOpen={(open) => setIsOpen(open)}
      />
    </>
  );
};
