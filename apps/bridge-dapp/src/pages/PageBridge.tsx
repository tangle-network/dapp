import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
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
  TabTrigger,
  TabsList,
  TabsRoot,
  TransactionQueueCard,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useCallback, useMemo, useState } from 'react';

import { useNoteAccount, useTxQueue } from '@webb-tools/react-hooks';
import { Note } from '@webb-tools/sdk-core';
import { InteractiveFeedbackView, WalletModal } from '../components';
import { ManageButton } from '../components/tables';
import {
  CreateAccountModal,
  DeleteNotesModal,
  UploadSpendNoteModal,
} from '../containers';
import { DepositContainer } from '../containers/DepositContainer';
import { TransferContainer } from '../containers/TransferContainer';
import { WithdrawContainer } from '../containers/WithdrawContainer';
import {
  ShieldedAssetsTableContainer,
  SpendNotesTableContainer,
} from '../containers/note-account-tables';
import { NoteAccountTableContainerProps } from '../containers/note-account-tables/types';
import {
  useConnectWallet,
  useShieldedAssets,
  useSpendNotes,
  useTryAnotherWalletWithView,
} from '../hooks';
import { downloadNotes } from '../utils';

const PageBridge = () => {
  // State for the tabs
  const [activeTab, setActiveTab] = useState<
    'Deposit' | 'Withdraw' | 'Transfer'
  >('Deposit');

  const { customMainComponent } = useWebbUI();
  const {
    activeAccount,
    activeChain,
    activeFeedback,
    activeWallet,
    loading,
    noteManager,
  } = useWebContext();

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

  const {
    allNotes,
    isOpenNoteAccountModal,
    isSuccessfullyCreatedNoteAccount,
    setOpenNoteAccountModal,
    setSuccessfullyCreatedNoteAccount,
  } = useNoteAccount();
  const { notificationApi } = useWebbUI();

  const [deleteNotes, setDeleteNotes] = useState<Note[] | undefined>(undefined);

  // download all notes
  const handleDownloadAllNotes = useCallback(async () => {
    if (!allNotes.size) {
      notificationApi({
        variant: 'error',
        message: 'No notes to download',
      });
      return;
    }

    // Serialize all notes to array of string
    const notes = Array.from(allNotes.values()).reduce((acc, curr) => {
      return acc.concat(curr);
    }, [] as Note[]);

    downloadNotes(notes);
  }, [allNotes, notificationApi]);

  const sharedNoteAccountTableContainerProps =
    useMemo<NoteAccountTableContainerProps>(
      () => ({
        onActiveTabChange: handleChangeTab,
        onUploadSpendNote: handleOpenUploadModal,
        onDefaultDestinationChainChange: updateDefaultDestinationChain,
        onDefaultFungibleCurrencyChange: updatedefaultFungibleCurrency,
        onDeleteNotesChange: (notes) => setDeleteNotes(notes),
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

  const sharedBridgeTabContainerProps = useMemo(
    () => ({
      defaultDestinationChain: defaultDestinationChain,
      defaultFungibleCurrency: defaultFungibleCurrency,
      onTryAnotherWallet: onTryAnotherWallet,
    }),
    [defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet]
  );

  return (
    <>
      <div className="w-full mt-6">
        <div className="flex items-start space-x-4">
          {customMainComponent}

          {/** Bridge tabs */}
          <TabsRoot
            value={activeTab}
            onValueChange={(nextTab) =>
              setActiveTab(nextTab as typeof activeTab)
            }
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
              <DepositContainer {...sharedBridgeTabContainerProps} />
            </TabContent>
            <TabContent value="Transfer">
              <TransferContainer {...sharedBridgeTabContainerProps} />
            </TabContent>
            <TabContent value="Withdraw">
              <WithdrawContainer {...sharedBridgeTabContainerProps} />
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
                  leftIcon={
                    <HelpLineIcon size="lg" className="!fill-current" />
                  }
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
                  onDownload={handleDownloadAllNotes}
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

        <DeleteNotesModal
          notes={deleteNotes}
          setNotes={(notes) => setDeleteNotes(notes)}
        />

        <WalletModal />

        <CreateAccountModal
          isOpen={isOpenNoteAccountModal}
          onOpenChange={(isOpen) => setOpenNoteAccountModal(isOpen)}
          isSuccess={isSuccessfullyCreatedNoteAccount}
          onIsSuccessChange={(success) =>
            setSuccessfullyCreatedNoteAccount(success)
          }
        />

        {/** Last login */}
      </div>

      <InteractiveFeedbackView activeFeedback={activeFeedback} />
    </>
  );
};

export default PageBridge;
