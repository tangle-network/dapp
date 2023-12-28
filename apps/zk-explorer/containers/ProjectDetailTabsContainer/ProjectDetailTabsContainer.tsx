import { type FC, Suspense } from 'react';
import cx from 'classnames';
import {
  TabsRoot,
  TabsList,
  TabTrigger,
  TabContent,
  SkeletonLoader,
} from '@webb-tools/webb-ui-components';

import Circuits from './Circuits';
import Summary from './Summary';
import TrustedSetup from './TrustedSetup';

interface ProjectDetailTabsContainerProps {
  className?: string;
}

const CIRCUITS_TAB = 'Circuits';
const SUMMARY_TAB = 'Summary';
const TRUSTED_SETUP_TAB = 'Trusted Setup';

const ProjectDetailTabsContainer: FC<ProjectDetailTabsContainerProps> = ({
  className,
}) => {
  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-6 rounded-2xl', className)}
    >
      <TabsRoot defaultValue={CIRCUITS_TAB}>
        <TabsList aria-label="project-detail-tabs" className="mb-6">
          <TabTrigger value={CIRCUITS_TAB}>Circuits</TabTrigger>
          <TabTrigger value={SUMMARY_TAB}>Summary</TabTrigger>
          <TabTrigger value={TRUSTED_SETUP_TAB}>Trusted Setup</TabTrigger>
        </TabsList>

        <div className="max-h-[900px] overflow-y-auto">
          <TabContent value={CIRCUITS_TAB}>
            <Suspense fallback={<SectionSkeletonLoader />}>
              <Circuits />
            </Suspense>
          </TabContent>

          <TabContent value={SUMMARY_TAB}>
            <Suspense fallback={<SectionSkeletonLoader />}>
              <Summary />
            </Suspense>
          </TabContent>

          <TabContent value={TRUSTED_SETUP_TAB}>
            <Suspense fallback={<SectionSkeletonLoader />}>
              <TrustedSetup />
            </Suspense>
          </TabContent>
        </div>
      </TabsRoot>
    </div>
  );
};

export default ProjectDetailTabsContainer;

/** @internal */
const SectionSkeletonLoader: FC = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div className="space-y-2" key={idx}>
          <SkeletonLoader size="xl" />
          <SkeletonLoader size="xl" />
        </div>
      ))}
    </div>
  );
};
