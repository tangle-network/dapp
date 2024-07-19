'use client';

import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Avatar } from '../Avatar';
import { Typography } from '../../typography/Typography';
import { DropdownBody } from './DropdownBody';
import DropdownMenuItem from './DropdownMenuItem';
import { AccountDropdownBodyProps } from './types';

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
      <ul>
        {accountItems.map(({ address, name, onClick }) => (
          <li key={address} onClick={onClick}>
            <DropdownMenuItem
              leftIcon={
                <Avatar
                  theme={
                    isEthereumAddress(address)
                      ? 'ethereum'
                      : isAddress(address)
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
    </DropdownBody>
  );
};

export default AccountDropdownBody;
