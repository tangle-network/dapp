import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import { TransactionState } from '@webb-tools/abstract-api-provider';
import {
  BlockIcon,
  CoinIcon,
  HelpLineIcon,
  SosLineIcon,
} from '@webb-tools/icons';
import { useScrollActions } from '@webb-tools/responsive-utils';
import {
  Button,
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  TransactionQueueCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { ManageButton } from '../components/tables';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
  UploadSpendNoteModal,
} from '../containers';

import { DepositContainer } from '../containers/DepositContainer';
import { TransferContainer } from '../containers/TransferContainer';
import { NoteAccountTableContainerProps } from '../containers/types';
import { WithdrawContainer } from '../containers/WithdrawContainer';
import {
  useShieldedAssets,
  useSpendNotes,
  useTryAnotherWalletWithView,
} from '../hooks';
import { useTxQueue, useNoteAccount } from '@webb-tools/react-hooks';
import { downloadString } from '@webb-tools/browser-utils';

const PageBridge = () => {
  // State for the tabs
  const [activeTab, setActiveTab] = useState<
    'Deposit' | 'Withdraw' | 'Transfer'
  >('Deposit');

  const { customMainComponent } = useWebbUI();
  const { noteManager } = useWebContext();
  const { smoothScrollToTop } = useScrollActions();

  const { txPayloads } = useTxQueue();

  // Upload modal state
  const [isUploadModalOpen, setUploadModalIsOpen] = useState(false);

  // Default state for destination chain and fungible currency
  // when action buttons are clicked in the note account table
  const [defaultDestinationChain, setDefaultDestinationChain] = useState<
    Chain | undefined
  >(undefined);
  const [defaultFungibleCurrency, setdefaultFungibleCurrency] = useState<
    Currency | undefined
  >(undefined);

  // Callback to update the default destination chain and fungible currency
  const updateDefaultDestinationChain = useCallback(
    (chain: Chain) => {
      smoothScrollToTop();
      setDefaultDestinationChain(chain);
    },
    [smoothScrollToTop]
  );

  const updatedefaultFungibleCurrency = useCallback((currency: Currency) => {
    setdefaultFungibleCurrency(currency);
  }, []);

  // Callback to open upload modal
  const handleOpenUploadModal = useCallback(() => {
    setUploadModalIsOpen(true);
  }, []);

  // Callback to change the active tab
  const handleChangeTab = useCallback(
    (tab: 'Deposit' | 'Withdraw' | 'Transfer') => {
      setActiveTab(tab);
    },
    []
  );

  const { allNotes } = useNoteAccount();
  const { notificationApi } = useWebbUI();

  // download all notes
  const handleDownload = useCallback(async () => {
    if (!allNotes.size) {
      notificationApi({
        variant: 'error',
        message: 'No notes to download',
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
    downloadString(JSON.stringify(notes), 'notes.json', '.json');
  }, [allNotes, notificationApi]);

  const sharedNoteAccountTableContainerProps =
    useMemo<NoteAccountTableContainerProps>(
      () => ({
        onActiveTabChange: handleChangeTab,
        onUploadSpendNote: handleOpenUploadModal,
        onDefaultDestinationChainChange: updateDefaultDestinationChain,
        ondefaultFungibleCurrencyChange: updatedefaultFungibleCurrency,
      }),
      [
        handleChangeTab,
        handleOpenUploadModal,
        updateDefaultDestinationChain,
        updatedefaultFungibleCurrency,
      ]
    );

  // Shielded assets table data
  const shieldedAssetsTableData = useShieldedAssets();

  // Spend notes table data
  const spendNotesTableData = useSpendNotes();

  // Try again for try another wallet link
  // in the token list
  const { TryAnotherWalletModal, onTryAnotherWallet } =
    useTryAnotherWalletWithView();

  const isDisplayTxQueueCard = useMemo(
    () => txPayloads.length > 0,
    [txPayloads]
  );

  return (
    <div className="w-full mt-6">
      <div className="flex items-start space-x-4">
        {customMainComponent}

        {/** Bridge tabs */}
        <TabsRoot
          value={activeTab}
          onValueChange={(nextTab) => setActiveTab(nextTab as typeof activeTab)}
          // The customMainComponent alters the global mainComponent for display.
          // Therfore, if the customMainComponent exists (input selected) then hide the base component.
          className={cx(
            'max-w-[550px] bg-mono-0 dark:bg-mono-180 p-4 rounded-lg space-y-4 grow',
            customMainComponent ? 'hidden' : 'block'
          )}
        >
          <TabsList aria-label="bridge action" className="mb-4">
            <TabTrigger value="Deposit">Deposit</TabTrigger>
            <TabTrigger value="Transfer">Transfer</TabTrigger>
            <TabTrigger value="Withdraw">Withdraw</TabTrigger>
          </TabsList>
          <TabContent value="Deposit">
            <DepositContainer
              defaultDestinationChain={defaultDestinationChain}
              defaultFungibleCurrency={defaultFungibleCurrency}
              onTryAnotherWallet={onTryAnotherWallet}
            />
          </TabContent>
          <TabContent value="Transfer">
            <TransferContainer
              defaultDestinationChain={defaultDestinationChain}
              defaultFungibleCurrency={defaultFungibleCurrency}
              onTryAnotherWallet={onTryAnotherWallet}
            />
          </TabContent>
          <TabContent value="Withdraw">
            <WithdrawContainer
              defaultDestinationChain={defaultDestinationChain}
              defaultFungibleCurrency={defaultFungibleCurrency}
              onTryAnotherWallet={onTryAnotherWallet}
            />
          </TabContent>
        </TabsRoot>

        <div>
          {/** Transaction Queue Card */}
          {isDisplayTxQueueCard && (
            <TransactionQueueCard
              className="w-full mb-4 max-w-none"
              transactions={txPayloads}
            />
          )}

          {/** Education cards */}
          <div className="p-9 max-w-[386px] bg-blue-10 dark:bg-blue-120 rounded-lg">
            <Typography
              variant="body1"
              fw="semibold"
              className="text-blue-70 dark:text-blue-50"
            >
              Learn about what makes Webb private and how this makes using it
              different from other bridges.
            </Typography>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                leftIcon={<CoinIcon size="lg" className="!fill-current" />}
                href="https://docs.webb.tools" // TODO: Determine link here
                target="_blank"
                variant="link"
              >
                Usage Guide
              </Button>

              <Button
                leftIcon={<BlockIcon size="lg" className="!stroke-current" />}
                href="https://docs.webb.tools" // TODO: Determine link here
                target="_blank"
                variant="link"
              >
                FAQ
              </Button>

              <Button
                leftIcon={<HelpLineIcon size="lg" className="!fill-current" />}
                href="https://docs.webb.tools"
                target="_blank"
                variant="link"
              >
                Get Started
              </Button>

              <Button
                leftIcon={<SosLineIcon size="lg" className="!fill-current" />}
                href="https://t.me/webbprotocol"
                target="_blank"
                variant="link"
              >
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/** Account stats table */}
      {noteManager && (
        <TabsRoot defaultValue="shielded-assets" className="mt-12 space-y-4">
          <div className="flex items-center justify-between mb-4">
            {/** Tabs buttons */}
            <TabsList
              aria-label="account-statistics-table"
              className="space-x-3.5 py-4"
            >
              <TabTrigger
                isDisableStyle
                value="shielded-assets"
                className="h5 radix-state-active:font-bold text-mono-100 radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0"
              >
                Shielded Assets
              </TabTrigger>
              <TabTrigger
                isDisableStyle
                value="available-spend-notes"
                className="h5 radix-state-active:font-bold text-mono-100 radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0"
              >
                Available Spend Notes
              </TabTrigger>
            </TabsList>

            {/** Right buttons (manage and filter) */}
            <div className="space-x-1">
              <ManageButton
                onUpload={handleOpenUploadModal}
                onDownload={handleDownload}
              />
            </div>
          </div>

          <TabContent value="shielded-assets">
            <ShieldedAssetsTableContainer
              data={shieldedAssetsTableData}
              {...sharedNoteAccountTableContainerProps}
            />
          </TabContent>
          <TabContent value="available-spend-notes">
            <SpendNotesTableContainer
              data={spendNotesTableData}
              {...sharedNoteAccountTableContainerProps}
            />
          </TabContent>
        </TabsRoot>
      )}

      <UploadSpendNoteModal
        isOpen={isUploadModalOpen}
        setIsOpen={(isOpen) => setUploadModalIsOpen(isOpen)}
      />

      <TryAnotherWalletModal />

      {/** Last login */}
    </div>
  );
};

export default PageBridge;
