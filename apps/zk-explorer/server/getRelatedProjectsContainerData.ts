import type { ProjectItem } from '../components/ProjectCard/types';

export default async function getRelatedProjectsContainerData(): Promise<
  ProjectItem[]
> {
  await new Promise((r) => setTimeout(r, 1000));

  return Array(5).fill({
    ownerAvatarUrl:
      'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
    repositoryOwner: 'webb',
    repositoryName: 'masp',
    stargazerCount: 123,
    circuitCount: 24,
    description:
      'Short blurb about what the purpose of this circuit. This is a longer line to test multiline.',
    contributorAvatarUrls: [
      'https://avatars.githubusercontent.com/u/76852793?s=200&v=4',
    ],
  }) satisfies ProjectItem[];
}
