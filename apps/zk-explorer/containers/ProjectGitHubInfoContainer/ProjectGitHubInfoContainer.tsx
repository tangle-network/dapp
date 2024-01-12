import { getProjectGitHubInfoContainerData } from '../../server';
import ProjectGitHubInfoClient from './client';

interface ProjectGitHubInfoContainerProps {
  className?: string;
}

export default async function ProjectGitHubInfoContainer({
  className,
}: ProjectGitHubInfoContainerProps) {
  const gitHubData = await getProjectGitHubInfoContainerData();

  return <ProjectGitHubInfoClient data={gitHubData} className={className} />;
}
