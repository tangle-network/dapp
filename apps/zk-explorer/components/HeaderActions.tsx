'use client';

import { Search, ThreeDotsVerticalIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { GitHubOAuthButton } from './GitHubOAuthButton';
import { handleOAuthError, handleOAuthSuccess } from '../utils/utils';
import { FC } from 'react';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { twMerge } from 'tailwind-merge';

export type HeaderActionsProps = PropsOf<'div'> & {
  doHideSearchBar?: boolean;
};

export const HeaderActions: FC<HeaderActionsProps> = ({
  className,
  doHideSearchBar,
}) => {
  const githubOAuthClientId = process.env.ZK_EXPLORER_GITHUB_CLIENT_ID;

  if (githubOAuthClientId === undefined || githubOAuthClientId === '') {
    throw new Error(
      'GitHub OAuth client ID is not defined. Did you forget to set the corresponding environment variable?'
    );
  }

  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row gap-4 md:gap-2 md:ml-auto items-start md:items-center',
        className
      )}
    >
      {!doHideSearchBar && (
        <Input
          id="search item"
          placeholder="Search projects & circuits"
          rightIcon={<Search />}
        />
      )}

      <div className="flex">
        {/* TODO: Consider showing a modal or toast message to let the user know when OAuth fails. */}
        <GitHubOAuthButton
          clientId={githubOAuthClientId}
          scope="user"
          onOAuthError={handleOAuthError}
          onOAuthSuccess={handleOAuthSuccess}
        />

        <Dropdown className="flex items-center justify-center">
          <DropdownBasicButton>
            <ThreeDotsVerticalIcon size="lg" />
          </DropdownBasicButton>

          <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
            <div className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
              <Typography variant="label" fw="bold">
                User menu
              </Typography>
            </div>
          </DropdownBody>
        </Dropdown>
      </div>
    </div>
  );
};
