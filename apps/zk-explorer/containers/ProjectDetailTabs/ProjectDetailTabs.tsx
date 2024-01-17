import {
  SkeletonLoader,
  TabContent,
  TabTrigger,
  TabsList,
  TabsRoot,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { Suspense, type FC } from 'react';
import Circuits from './Circuits/Circuits';
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
      className={cx(
        'bg-mono-0 dark:bg-mono-180 p-4 md:p-6 space-y-6 rounded-2xl',
        className
      )}
    >
      <TabsRoot defaultValue={CIRCUITS_TAB} className="h-[100%] flex flex-col">
        <TabsList aria-label="project-detail-tabs" className="mb-6">
          <TabTrigger value={CIRCUITS_TAB}>Circuits</TabTrigger>
          <TabTrigger value={SUMMARY_TAB}>Summary</TabTrigger>
          <TabTrigger value={TRUSTED_SETUP_TAB}>Trusted Setup</TabTrigger>
        </TabsList>

        <div className="grow relative bg-mono-20 dark:bg-mono-200 rounded-2xl">
          <div className="max-h-[700px] lg:!max-h-[none] lg:absolute lg:top-0 lg:bottom-0 lg:left-0 lg:right-0 overflow-auto">
            <TabContent
              value={CIRCUITS_TAB}
              className="min-w-[875px] md:!min-w-[unset] h-[700px] lg:h-full"
            >
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
