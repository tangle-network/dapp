'use client';

import {
  Input,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Typography,
  Breadcrumbs,
  BreadcrumbsItem,
} from '@webb-tools/webb-ui-components';
import {
  ThreeDotsVerticalIcon,
  Search,
  CheckboxBlankCircleLine,
} from '@webb-tools/icons';
import { FC } from 'react';
import { GitHubOAuthButton } from './GitHubOAuthButton/GitHubOAuthButton';
import { PropsOf } from '@webb-tools/webb-ui-components/types';

export const Header: FC<PropsOf<'header'>> = (props) => {
  const githubOAuthClientId = process.env.ZK_EXPLORER_GITHUB_CLIENT_ID;

  if (githubOAuthClientId === undefined || githubOAuthClientId === '') {
    throw new Error(
      'GitHub OAuth client ID is not defined. Did you forget to set the corresponding environment variable?'
    );
  }

  return (
    <header className="py-4 flex flex-col sm:flex-row gap-4" {...props}>
      {/* TODO: Base breadcrumbs on the pathname */}
      <Breadcrumbs>
        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-60" variant="body1" fw="bold">
            ZK Explorer
          </Typography>
        </BreadcrumbsItem>

        <BreadcrumbsItem icon={<CheckboxBlankCircleLine />}>
          <Typography className="text-mono-0" variant="body1" fw="bold">
            Upload Project
          </Typography>
        </BreadcrumbsItem>
      </Breadcrumbs>

      <div className="flex flex-col sm:flex-row gap-4 md:gap-2 md:ml-auto items-start">
        <Input
          id="search item"
          placeholder="Search item"
          rightIcon={<Search />}
        />

        <div className="flex">
          {/* TODO: Consider showing a modal or toast message to let the user know when OAuth fails. */}
          <GitHubOAuthButton
            clientId={githubOAuthClientId}
            scope="user"
            onOAuthError={(params) =>
              alert(`Authorization failed: ${params.errorDescription}`)
            }
            onOAuthSuccess={(params) =>
              alert(`Authorization successful, code: ${params.code}`)
            }
          />

          <Dropdown className="flex items-center justify-center">
            <DropdownBasicButton>
              <ThreeDotsVerticalIcon size="lg" />
            </DropdownBasicButton>

            <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
              <div className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
                <Typography variant="label" fw="bold">
                  Item 1
                </Typography>
              </div>
            </DropdownBody>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
