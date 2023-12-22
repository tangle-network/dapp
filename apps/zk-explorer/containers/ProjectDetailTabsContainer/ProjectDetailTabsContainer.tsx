import { type FC } from 'react';
import cx from 'classnames';

interface ProjectDetailTabsContainerProps {
  className?: string;
}

const ProjectDetailTabsContainer: FC<ProjectDetailTabsContainerProps> = ({
  className,
}) => {
  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-6 rounded-2xl', className)}
    >
      ProjectDetailTabsContainer
    </div>
  );
};

export default ProjectDetailTabsContainer;
