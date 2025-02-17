import { ApiConfig, WalletConfig } from '../../../../dapp-config/src/index.ts';
import { notificationApi } from '../Notification';
import { PropsOf } from '../../types';
import { WalletId, WebbError } from '../../../../dapp-types/src/index.ts';
import { SupportedBrowsers } from '../../../../browser-utils/src/platform/getPlatformMetaData';
export interface WalletModalProps extends PropsOf<'div'> {
    /**
     * The api to use for notifications
     */
    notificationApi: typeof notificationApi;
    /**
     * The api config to use for the wallet modal
     */
    apiConfig: ApiConfig;
    /**
     * The wallet id that is currently connecting
     */
    connectingWalletId?: WalletId;
    /**
     * The wallet id that has failed to connect
     */
    failedWalletId?: WalletId;
    /**
     * Is the modal open
     */
    isModalOpen: boolean;
    /**
     * Reset the state of the modal
     */
    resetState: () => void;
    /**
     * The selected wallet
     */
    selectedWallet?: WalletConfig;
    /**
     * Connect the wallet
     */
    connectWallet: (wallet: WalletConfig, targetTypedChainIds?: {
        evm?: number;
        substrate?: number;
    }) => void | Promise<void>;
    /**
     * Toggle the modal
     */
    toggleModal: (isOpen?: boolean | undefined, typedChainId?: number | undefined) => void;
    /**
     * The error that has occurred when connecting
     */
    connectError?: WebbError;
    /**
     * The wallets to display in the modal
     */
    supportedWallets: WalletConfig[];
    /**
     * The current browser platform id
     */
    platformId: SupportedBrowsers | null;
    /**
     * The targeting specific evm or substrate chain when connecting wallets
     */
    targetTypedChainIds?: {
        evm?: number;
        substrate?: number;
    };
    /**
     * The default text to display when there's no connection and error yet
     */
    contentDefaultText?: string;
}
