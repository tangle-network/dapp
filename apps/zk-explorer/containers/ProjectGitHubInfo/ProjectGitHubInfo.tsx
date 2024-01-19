import { fetchProjectGitHubInfo } from '../../server/projectDetails';
import ProjectGitHubInfoClient from './client';

type ProjectGitHubInfoContainerProps = {
  className?: string;
};

export default async function ProjectGitHubInfoContainer({
  className,
}: ProjectGitHubInfoContainerProps) {
  const gitHubInfo = await fetchProjectGitHubInfo();

  return (
    <ProjectGitHubInfoClient githubInfo={gitHubInfo} className={className} />
  );
}
