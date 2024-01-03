import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { DashboardOverviewTab } from '../../components/DashboardOverviewTab';
import { DashboardSettingsTab } from '../../components/DashboardSettingsTab';
import { Header } from '../../components/Header';
import { Tabs, TabsContent } from '../../components/Tabs';
import { RelativePageUrl } from '../../utils';

export default function Dashboard() {
  return (
    <main className="flex flex-col gap-6">
      <Header />

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
        <TabsContent>
          <DashboardOverviewTab />
        </TabsContent>

        <TabsContent>
          <DashboardSettingsTab />
        </TabsContent>

        <TabsContent>
          <BillingTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

/** @internal */
const BillingTab: FC = () => {
  // TODO: Implement billing tab.
  return <div>Billing details will be shown here in the future.</div>;
};
