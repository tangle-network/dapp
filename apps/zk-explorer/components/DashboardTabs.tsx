// TODO: Figure out why without this (even though React hooks are not used), the tabs component doesn't work. Ideally, this should be just a direct part of the `Dashboard` page's children, without the need to `use client`.
'use client';

import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { RelativePageUrl } from '../utils';
import { DashboardOverviewTab } from './DashboardOverviewTab';
import { DashboardSettingsTab } from './DashboardSettingsTab';
import { Tabs } from './Tabs';

export const DashboardTabs: FC = () => {
  return (
    <Tabs
      tabs={[{ name: 'Overview' }, { name: 'Settings' }, { name: 'Billing' }]}
      rightContent={
        <div className="flex gap-4">
          <Button
            size="sm"
            variant="utility"
            isFullWidth
            className="w-full sm:w-auto"
            rightIcon={<PlusIcon className="dark:fill-blue-50" />}
            href={RelativePageUrl.SubmitProject}
          >
            <Typography
              variant="body4"
              fw="bold"
              className="dark:text-blue-50 uppercase"
            >
              Upload Project
            </Typography>
          </Button>
        </div>
      }
    >
      <Tabs.Content>
        <DashboardOverviewTab />
      </Tabs.Content>

      <Tabs.Content>
        <DashboardSettingsTab />
      </Tabs.Content>

      <Tabs.Content>
        <BillingTab />
      </Tabs.Content>
    </Tabs>
  );
};

/** @internal */
const BillingTab: FC = () => {
  // TODO: Implement billing tab.
  return <div>Billing details will be shown here in the future.</div>;
};
