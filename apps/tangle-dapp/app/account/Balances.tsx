import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect } from 'react';

import HiddenValue from '../../components/HiddenValue';
import HiddenValueEye from '../../components/HiddenValueEye';
import useFormattedAccountBalances from '../../data/AccountSummaryCard/useFormattedAccountBalances';

const Balances: FC = () => {
  const { activeAccount, loading, isConnecting, wallets } = useWebContext();

  const {
    total: totalBalance,
    locked: lockedBalance,
    free: freeBalance,
  } = useFormattedAccountBalances(false);

  const {
    toggleModal: toggleWalletConnectModal,
    isWalletConnected,
    isModalOpen,
  } = useConnectWallet();

  // Initially open connect wallet modal for the user to
  // connect their wallet if not already connected. This
  // is required on the account page.
  useEffect(() => {
    const isAlreadyConnectingOrConnected =
      loading ||
      isConnecting ||
      activeAccount !== null ||
      isModalOpen ||
      isWalletConnected;

    if (isAlreadyConnectingOrConnected) {
      return;
    }

    toggleWalletConnectModal(true);
  }, [
    activeAccount,
    isConnecting,
    isModalOpen,
    isWalletConnected,
    loading,
    toggleWalletConnectModal,
    wallets,
  ]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <div className="flex items-center gap-2">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-40"
          >
            Total Balance
          </Typography>

          <HiddenValueEye />
        </div>

        <div className="flex items-center gap-4">
          {totalBalance !== null ? (
            <div className="flex gap-2 items-end py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                <HiddenValue>{totalBalance}</HiddenValue>
              </Typography>

              {/* TODO: Get the token symbol from the API, or the constants if appropriate. */}
              <Typography
                variant="h4"
                fw="normal"
                className="!leading-none pb-1"
              >
                tTNT
              </Typography>
            </div>
          ) : (
            <SkeletonLoader size="xl" />
          )}
        </div>
      </div>

      <div className="flex gap-6 w-full">
        <div className="flex flex-col gap-4 w-full">
          <Typography variant="body1" fw="normal">
            Free Balance
          </Typography>

          {freeBalance !== null ? (
            <Typography variant="h4" fw="bold">
              <HiddenValue>{freeBalance}</HiddenValue>
            </Typography>
          ) : (
            <SkeletonLoader size="lg" />
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Typography variant="body1" fw="normal">
            Locked Balance
          </Typography>

          {lockedBalance !== null ? (
            <Typography variant="h4" fw="bold">
              <HiddenValue>{lockedBalance}</HiddenValue>
            </Typography>
          ) : (
            <SkeletonLoader size="lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Balances;
