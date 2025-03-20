import { UIErrorBoundary } from '@tangle-network/ui-components';
import cx from 'classnames';
import { Suspense } from 'react';
import { ErrorFallback, RankingTable } from '../components/RankingTable';
import { logger } from '../utils/logger';

export default function IndexPage() {
  return (
    <div
      className={cx(
        'px-12 py-6',
        'border-2 border-mono-0 dark:border-mono-160 rounded-2xl',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)]',
      )}
    >
      {/* TODO: Add error and loading state */}
      <Suspense fallback={<div>Loading...</div>}>
        <UIErrorBoundary Fallback={ErrorFallback} logger={logger}>
          <RankingTable />
        </UIErrorBoundary>
      </Suspense>
    </div>
  );
}
