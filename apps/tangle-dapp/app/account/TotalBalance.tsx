import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect } from 'react';

import HiddenValue from '../../components/HiddenValue';
import HiddenValueEye from '../../components/HiddenValueEye';
import { TOKEN_UNIT } from '../../constants/polkadot';
import useAccountBalances from '../../hooks/useAccountBalances';
import useFormattedBalance from '../../hooks/useFormattedBalance';

const TotalBalance: FC = () => {
  const { activeAccount, loading, isConnecting, wallets } = useWebContext();
  const { total } = useAccountBalances();
  const formattedTotal = useFormattedBalance(total, false);

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
          {formattedTotal !== null ? (
            <div className="flex gap-2 items-end py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                <HiddenValue>{formattedTotal}</HiddenValue>
              </Typography>

              <Typography
                variant="h4"
                fw="normal"
                className="!leading-none pb-1"
              >
                {TOKEN_UNIT}
              </Typography>
            </div>
          ) : (
            <SkeletonLoader size="xl" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TotalBalance;
