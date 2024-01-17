'use client';

import { Search, ThreeDotsVerticalIcon } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import SearchInput from '../../components/SearchInput';
import { useSidebarContext } from '../../context/SidebarContext';
import { useAuth } from '../../hooks/useAuth';
import useTailwindBreakpoint, {
  TailwindBreakpoint,
} from '../../hooks/useTailwindBreakpoint';
import { exchangeAuthCodeForOAuthToken } from '../../server/auth';
import { RelativePageUrl } from '../../utils';
import GitHubOAuthButton from '../GitHubOAuthButton';
import {
  GitHubOAuthErrorParams,
  GitHubOAuthSuccessParams,
} from '../GitHubOAuthButton/types';
import SidebarCloseButton from './SidebarCloseButton';

export type HeaderControlsProps = PropsOf<'div'> & {
  doHideSearchBar?: boolean;
};

const HeaderControls: FC<HeaderControlsProps> = ({
  className,
  doHideSearchBar,
  ...rest
}) => {
  // TODO: Should throw error when client id is empty.
  const githubOAuthClientId = process.env.ZK_EXPLORER_GITHUB_CLIENT_ID ?? '';

  const breakpoint = useTailwindBreakpoint();
  const { user } = useAuth();
  const { setSidebarOpen, updateSidebarContent } = useSidebarContext();
  const router = useRouter();
  const { notificationApi } = useWebbUI();

  const prepareAndShowSearchSidebar = useCallback(() => {
    updateSidebarContent(
      <div className="flex flex-col gap-4">
        <SidebarCloseButton isRightAligned setSidebarOpen={setSidebarOpen} />

        <SearchInput doesRedirectOnChange id="sidebar mobile search" />
      </div>
    );

    setSidebarOpen(true);
  }, [setSidebarOpen, updateSidebarContent]);

  // When the user is logged in and clicks on the GitHub OAuth
  // button, redirect them to the dashboard.
  const handleUserProfileClick = useCallback(() => {
    router.push(RelativePageUrl.Dashboard);
  }, [router]);

  const handleOAuthError = useCallback(
    (params: GitHubOAuthErrorParams) => {
      notificationApi({
        variant: 'error',
        message: `GitHub OAuth login failed: ${params.errorDescription}`,
      });
    },
    [notificationApi]
  );

  const handleOAuthSuccess = useCallback(
    async (params: GitHubOAuthSuccessParams) => {
      if (!(await exchangeAuthCodeForOAuthToken(params.code))) {
        notificationApi({
          variant: 'error',
          message:
            'GitHub OAuth login failed: Could not exchange auth code for OAuth token.',
        });
      }
    },
    [notificationApi]
  );

  return (
    <div
      {...rest}
      className={twMerge(
        'flex flex-col items-end sm:flex-row justify-between sm:items-start md:items-center gap-4 md:gap-2',
        className
      )}
    >
      {!doHideSearchBar && breakpoint > TailwindBreakpoint.SM && (
        <SearchInput doesRedirectOnChange id="desktop search" />
      )}

      <div className="flex gap-2 items-center">
        <GitHubOAuthButton
          clientId={githubOAuthClientId}
          scope="user"
          onOAuthError={handleOAuthError}
          onOAuthSuccess={handleOAuthSuccess}
          username={user?.githubUsername}
          onSignedInClick={handleUserProfileClick}
        />

        {/* Mobile search button */}
        {!doHideSearchBar && breakpoint <= TailwindBreakpoint.SM && (
          <Search
            className="cursor-pointer"
            size="lg"
            onClick={prepareAndShowSearchSidebar}
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

export default HeaderControls;
