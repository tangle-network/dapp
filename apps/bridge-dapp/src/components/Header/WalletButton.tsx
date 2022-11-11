import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import { Account } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  currenciesConfig,
  ManagedWallet,
  WalletConfig,
} from '@webb-tools/dapp-config';
import {
  ExternalLinkLine,
  LoginBoxLineIcon,
  ThreeDotsVerticalIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { useWallets } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  Avatar,
  Button,
  ChainListCard,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  shortenString,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { ClearDataModal } from './ClearDataModal';
import { HeaderButton } from './HeaderButton';
import { WalletModal } from './WalletModal';

export const WalletButton: FC<{ account: Account; wallet: WalletConfig }> = ({
  account,
  wallet,
}) => {
  // State for loading spinner when syncing notes
  const [isSyncingNote, setIsSyncingNote] = useState(false);

  // Clear data modal
  const [isOpen, setIsOpen] = useState(false);

  const { activeApi, activeChain, noteManager, chains } = useWebContext();

  const { setMainComponent } = useWebbUI();

  // Get all managed wallets
  const { wallets } = useWallets();

  const currentManagedWallet = useMemo<ManagedWallet | undefined>(() => {
    return wallets.find((w) => w.connected);
  }, [wallets]);

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

  // TODO: Implement clear data function here
  const handleClearData = useCallback(async () => {
    console.warn('Clear data fuction is not implemented yet');
    setIsOpen(false);
  }, []);

  // TODO: Implement save backups function here
  const handleSaveBackups = useCallback(async () => {
    console.warn('Save backups function is not implemented yet');
  }, []);

  const handleSyncNotes = useCallback(async () => {
    setIsSyncingNote(true);
    if (
      activeApi &&
      activeApi.state.activeBridge &&
      activeChain &&
      noteManager
    ) {
      const chainNotes =
        await activeApi.methods.variableAnchor.actions.inner.syncNotesForKeypair(
          activeApi.state.activeBridge.targets[
            calculateTypedChainId(activeChain.chainType, activeChain.chainId)
          ],
          noteManager.getKeypair()
        );

      await Promise.all(
        chainNotes
          // Do not display notes that have zero value.
          .filter((note) => note.note.amount !== '0')
          .map(async (note) => {
            console.log(note.serialize());
            await noteManager.addNote(note);
            return note;
          })
      );
    }
    setIsSyncingNote(false);
  }, [activeApi, activeChain, noteManager]);

  // Funciton to switch chain
  const handleSwitchChain = useCallback(async () => {
    const sourceChains = Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });

    setMainComponent(
      <ChainListCard
        className="w-[550px] h-[720px]"
        chainType="source"
        chains={sourceChains}
        value={{ name: activeChain.name, symbol: activeChain.name }}
        onClose={() => setMainComponent(undefined)}
        onChange={async (selectedChain) => {
          const chain = Object.values(chains).find(
            (val) => val.name === selectedChain.name
          );

          setMainComponent(
            <WalletModal chain={chain} sourceChains={sourceChains} />
          );
        }}
      />
    );
  }, [activeChain, chains, setMainComponent]);

  // Disconnect function
  // TODO: The disconnect function does not work properly
  const handleDisconnect = useCallback(async () => {
    if (currentManagedWallet && currentManagedWallet.canEndSession) {
      currentManagedWallet.endSession();
    }
  }, [currentManagedWallet]);

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

        <DropdownBody className="mt-6 w-[360px] p-4 space-y-4">
          <div className="flex items-center justify-between">
            {/** Left content */}
            <div className="flex items-start space-x-2">
              {/** TODO: Calculate correct theme here */}
              <Avatar value={account.address} theme="ethereum" />

              <div>
                <Typography variant="h5" fw="bold" className="capitalize">
                  {account.name || wallet.name}
                </Typography>

                <div className="flex items-center space-x-1">
                  <Typography variant="body1" fw="bold" className="capitalize">
                    {shortenString(account.address, 6)}
                  </Typography>

                  <a href="https://webb.tools" target="_blank" rel="noreferrer">
                    <ExternalLinkLine />
                  </a>
                </div>
              </div>
            </div>

            {/** Right content */}
            <div className="flex items-center space-x-1">
              <Button
                isLoading={isSyncingNote}
                onClick={handleSyncNotes}
                variant="utility"
              >
                Sync Notes
              </Button>

              <Dropdown>
                <DropdownBasicButton>
                  <ThreeDotsVerticalIcon />
                </DropdownBasicButton>
                <DropdownBody>
                  <MenuItem onClick={() => setIsOpen(true)}>
                    Clear data
                  </MenuItem>
                </DropdownBody>
              </Dropdown>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button
              onClick={handleSwitchChain}
              leftIcon={<WalletLineIcon className="!fill-current" size="lg" />}
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
        </DropdownBody>
      </Dropdown>
      <ClearDataModal
        onSaveBackups={handleSaveBackups}
        onClearData={handleClearData}
        isOpen={isOpen}
        setIsOpen={(open) => setIsOpen(open)}
      />
    </>
  );
};
