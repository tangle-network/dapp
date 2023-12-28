import { type FC } from 'react';
import cx from 'classnames';
import {
  TabsRoot,
  TabsList,
  TabTrigger,
  TabContent,
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

        <TabContent value={CIRCUITS_TAB}>
          <Circuits />
        </TabContent>

        <TabContent value={SUMMARY_TAB}>
          <Summary />
        </TabContent>

        <TabContent value={TRUSTED_SETUP_TAB}>
          <TrustedSetup />
        </TabContent>
      </TabsRoot>
    </div>
  );
};

export default ProjectDetailTabsContainer;
