import { Suspense } from 'react';
import { Typography } from '@webb-tools/webb-ui-components';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLayout } from '@/components/layout/PageLayout';
import { AccountSummaryCard } from '@/components/account/AccountSummaryCard';
import { BalancesTableContainer } from '@/containers/BalancesTableContainer';

// Keep metadata configuration for SEO
export const pageConfig = {
  title: 'Account',
  isHomepage: true,
  metadata: {
    title: 'Account | Tangle Network',
    description: 'View and manage your Tangle Network account',
    openGraph: {
      title: 'Account | Tangle Network',
      description: 'View and manage your Tangle Network account',
    },
  },
} as const;

const AccountPage = () => {
  return (
    <PageLayout
      title={pageConfig.title}
      metadata={pageConfig.metadata}
      className="flex flex-col gap-5"
    >
      <ErrorBoundary
        fallback={
          <Typography variant="body1" color="error">
            Error loading account summary
          </Typography>
        }
      >
        <AccountSummaryCard className="max-w-full md:max-w-full" />
      </ErrorBoundary>

      <div className="space-y-4">
        <Typography variant="h4" fw="bold">
          Balances
        </Typography>

        <ErrorBoundary
          fallback={
            <Typography variant="body1" color="error">
              Error loading balances
            </Typography>
          }
        >
          <BalancesTableContainer />
        </ErrorBoundary>
      </div>
    </PageLayout>
  );
};

export default AccountPage;
