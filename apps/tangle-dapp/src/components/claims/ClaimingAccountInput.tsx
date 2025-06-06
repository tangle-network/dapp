import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import {
  WebbError,
  WebbErrorCodes,
} from '@tangle-network/dapp-types/WebbError';
import { ChevronDown } from '@tangle-network/icons';
import { WebbWeb3Provider } from '@tangle-network/web3-api-provider/webb-provider';
import { useUIContext } from '@tangle-network/ui-components';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import {
  AccountDropdownBody,
  Dropdown,
  DropdownButton,
} from '@tangle-network/ui-components/components/Dropdown';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useWalletAccounts from '../../hooks/useWalletAccounts';
import { BaseError } from 'viem';

type Props = {
  activeAccountAddress: string;
  isDisabled?: boolean;
};

const ClaimingAccountInput: FC<Props> = ({
  activeAccountAddress,
  isDisabled,
}) => {
  const { activeApi, setActiveAccount } = useWebContext();
  const { notificationApi } = useUIContext();
  const accounts = useWalletAccounts();

  const handleEvmSwitch = async (
    walletClient: WebbWeb3Provider['walletClient'],
  ) => {
    try {
      await walletClient.requestPermissions({ eth_accounts: {} });
    } catch (error) {
      const message =
        error instanceof BaseError
          ? error.shortMessage
          : WebbError.from(WebbErrorCodes.SwitchAccountFailed).message;

      notificationApi({ variant: 'error', message });
    }
  };

  return (
    <div className="space-y-4">
      <Typography variant="body1" fw="bold">
        Claiming Account (EVM or Substrate)
      </Typography>

      {activeApi instanceof WebbWeb3Provider ? (
        <button
          disabled={isDisabled}
          onClick={() => handleEvmSwitch(activeApi.walletClient)}
          className={twMerge(
            'w-full p-4 border rounded-full group',
            'flex items-center justify-between',
            'bg-mono-0 dark:bg-mono-180',
            'border-mono-80 dark:border-mono-120',
            'text-mono-140 dark:text-mono-40',
            'hover:enabled:border-blue-40 dark:hover:enabled:border-blue-70',
            'disabled:opacity-80',
          )}
        >
          <div className="flex items-center space-x-1 w-full max-w-full overflow-x-hidden">
            <Avatar theme="ethereum" value={activeAccountAddress} />

            <span className="text-inherit body1">{activeAccountAddress}</span>
          </div>

          <ChevronDown />
        </button>
      ) : (
        <Dropdown className="w-full">
          <DropdownButton
            disabled={isDisabled}
            className="w-full px-4 py-4 rounded-full normal-case"
            icon={<Avatar theme="substrate" value={activeAccountAddress} />}
          >
            {activeAccountAddress}
          </DropdownButton>

          <AccountDropdownBody
            accountItems={accounts.map((account) => {
              return {
                address: account.address,
                name: account.name,
                onClick: () => setActiveAccount(account.originalAccount),
              };
            })}
          />
        </Dropdown>
      )}
    </div>
  );
};

export default ClaimingAccountInput;
