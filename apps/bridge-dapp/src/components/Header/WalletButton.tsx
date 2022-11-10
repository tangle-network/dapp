import { Account } from '@webb-tools/abstract-api-provider';
import { WalletConfig } from '@webb-tools/dapp-config';
import { Trigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  MenuItem,
  shortenString,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo } from 'react';
import { HeaderButton } from './HeaderButton';
import {
  ExternalLinkLine,
  LoginBoxLineIcon,
  ThreeDotsVerticalIcon,
  WalletLineIcon,
} from '@webb-tools/icons';

export const WalletButton: FC<{ account: Account; wallet: WalletConfig }> = ({
  account,
  wallet,
}) => {
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

  return (
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
            <Button variant="utility">Sync Notes</Button>

            <Dropdown>
              <DropdownBasicButton>
                <ThreeDotsVerticalIcon />
              </DropdownBasicButton>
              <DropdownBody>
                <MenuItem>Clear data</MenuItem>
              </DropdownBody>
            </Dropdown>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button
            leftIcon={<WalletLineIcon className="!fill-current" size="lg" />}
            variant="link"
          >
            Switch
          </Button>

          <Button
            leftIcon={<LoginBoxLineIcon className="!fill-current" size="lg" />}
            variant="link"
          >
            Disconnect
          </Button>
        </div>
      </DropdownBody>
    </Dropdown>
  );
};
