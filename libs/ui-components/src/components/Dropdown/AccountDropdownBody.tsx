'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Avatar } from '../Avatar';
import { Typography } from '../../typography/Typography';
import { DropdownBody } from './DropdownBody';
import DropdownMenuItem from './DropdownMenuItem';
import { AccountDropdownBodyProps } from './types';
import { isSubstrateAddress } from '../../utils';
import { ScrollArea } from '../ScrollArea';

const AccountDropdownBody: FC<AccountDropdownBodyProps> = ({
  accountItems,
  className,
  addressShortenFn,
}) => {
  return (
    <DropdownBody
      className={twMerge(
        'radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]',
        className,
      )}
    >
      <ScrollArea className="max-h-96 overflow-y-auto">
        <ul>
          {accountItems.map(({ address, name, onClick }) => (
            <li key={address} onClick={onClick}>
              <DropdownMenuItem
                // Don't automatically capitalize addresses.
                textTransform=""
                leftIcon={
                  <Avatar
                    theme={
                      isEthereumAddress(address)
                        ? 'ethereum'
                        : isSubstrateAddress(address)
                          ? 'substrate'
                          : undefined
                    }
                    value={address}
                  />
                }
              >
                {name}{' '}
                <Typography variant="mkt-caption">
                  {addressShortenFn ? addressShortenFn(address) : address}
                </Typography>
              </DropdownMenuItem>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </DropdownBody>
  );
};

export default AccountDropdownBody;
