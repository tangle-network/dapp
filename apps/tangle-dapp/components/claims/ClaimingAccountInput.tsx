'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { ChevronDown } from '@webb-tools/icons';
import isViemError from '@webb-tools/web3-api-provider/utils/isViemError';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider/webb-provider';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  activeAccountAddress: string;
  isDisabled?: boolean;
};

const ClaimingAccountInput: FC<Props> = ({
  activeAccountAddress,
  isDisabled,
}) => {
  const { activeApi, accounts, setActiveAccount } = useWebContext();
  const { notificationApi } = useWebbUI();

  const handleEvmSwitch = async (
    walletClient: WebbWeb3Provider['walletClient'],
  ) => {
    try {
      await walletClient.requestPermissions({ eth_accounts: {} });
    } catch (error) {
      let message = WebbError.from(WebbErrorCodes.SwitchAccountFailed).message;

      if (isViemError(error)) {
        message = error.shortMessage;
      }

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
            size="sm"
            className="w-full px-4 py-4 rounded-full"
            icon={<Avatar theme="substrate" value={activeAccountAddress} />}
            label={activeAccountAddress}
          />

          <DropdownBody className="radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]">
            <ul>
              {accounts.map((account) => (
                <li
                  key={account.address}
                  onClick={() => setActiveAccount(account)}
                >
                  <MenuItem
                    startIcon={
                      <Avatar theme="substrate" value={account.address} />
                    }
                  >
                    {account.name}{' '}
                    <Typography variant="mkt-caption">
                      {account.address}
                    </Typography>
                  </MenuItem>
                </li>
              ))}
            </ul>
          </DropdownBody>
        </Dropdown>
      )}
    </div>
  );
};

export default ClaimingAccountInput;
