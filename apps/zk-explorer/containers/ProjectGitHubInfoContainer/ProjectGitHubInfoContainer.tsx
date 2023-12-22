import { type FC } from 'react';
import cx from 'classnames';

interface ProjectGitHubInfoContainerProps {
  className?: string;
}

const ProjectGitHubInfoContainer: FC<ProjectGitHubInfoContainerProps> = ({
  className,
}) => {
  return (
    <div
      className={cx('dark:bg-mono-180 p-6 space-y-6 rounded-2xl', className)}
    >
      ProjectGitHubInfoContainer
    </div>
  );
};

export default ProjectGitHubInfoContainer;
