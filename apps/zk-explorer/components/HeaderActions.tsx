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
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../hooks/useTailwindBreakpoint';
import { useSidebarContext } from '../hooks/useSidebarContext';
import { SidebarCloseButton } from './SidebarCloseButton';

export type HeaderActionsProps = PropsOf<'div'> & {
  doHideSearchBar?: boolean;
};

export const HeaderActions: FC<HeaderActionsProps> = ({
  className,
  doHideSearchBar,
  ...rest
}) => {
  // TODO: Should throw error when client id is empty.
  const githubOAuthClientId = process.env.ZK_EXPLORER_GITHUB_CLIENT_ID ?? '';

  const breakpoint = useTailwindBreakpoint();

  const { setSidebarOpen, updateSidebarContent } = useSidebarContext();

  const searchInput = (
    <Input
      id="search item"
      placeholder="Search projects & circuits"
      rightIcon={<Search />}
    />
  );

  const prepareAndShowSearchSidebar = () => {
    updateSidebarContent(
      <div className="flex flex-col gap-4">
        <SidebarCloseButton isRightmost setSidebarOpen={setSidebarOpen} />

        {searchInput}
      </div>
    );

    setSidebarOpen(true);
  };

  return (
    <div
      {...rest}
      className={twMerge(
        'flex flex-col items-end sm:flex-row justify-between sm:items-start md:items-center gap-4 md:gap-2',
        className
      )}
    >
      {!doHideSearchBar && breakpoint > TailwindBreakpoint.SM && searchInput}

      <div className="flex gap-2 items-center">
        {/* TODO: Consider showing a modal or toast message to let the user know when OAuth fails. */}
        <GitHubOAuthButton
          clientId={githubOAuthClientId}
          scope="user"
          onOAuthError={handleOAuthError}
          onOAuthSuccess={handleOAuthSuccess}
        />

        {/* Mobile search button */}
        {!doHideSearchBar && breakpoint <= TailwindBreakpoint.SM && (
          <Search
            className="cursor-pointer"
            size="lg"
            onClick={() => prepareAndShowSearchSidebar()}
          />
        )}

        <Dropdown className="relative flex items-center justify-center">
          <DropdownBasicButton>
            <ThreeDotsVerticalIcon className="fill-mono-0" size="lg" />
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
