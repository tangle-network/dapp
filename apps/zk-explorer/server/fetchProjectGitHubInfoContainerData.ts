import { getGitHubLanguageColors } from '../utils';

type TopContributorType = {
  name: string;
  avatarUrl: string;
  profileUrl: string;
};

export type ProjectGitHubInfoContainerDataType = {
  fullName: string;
  avatarUrl: string;
  description: string;
  tags: string[];
  readmeUrl: string;
  license: {
    name: string;
    url?: string;
  };
  activityUrl: string;
  starsCount: number;
  starsUrl: string;
  watchersCount: number;
  watchersUrl: string;
  forksCount: number;
  forksUrl: string;
  releasesCount: number;
  latestRelease: string;
  latestReleaseUrl: string;
  releasesUrl: string;
  contributorsCount: number;
  topContributors: TopContributorType[];
  contributorsUrl: string;
  languagesInfo: Record<
    string,
    {
      percentage: number;
      color: string;
    }
  >;
};

export default async function fetchProjectGitHubInfoContainerData(): Promise<ProjectGitHubInfoContainerDataType> {
  await new Promise((r) => setTimeout(r, 1000));

  const languageColors = await getGitHubLanguageColors([
    'TypeScript',
    'Rust',
    'Solidity',
    'JavaScript',
    'Shell',
    'Nix',
    'Dockerfile',
  ]);

  return {
    fullName: 'webb-tools/tangle',
    avatarUrl: 'https://avatars.githubusercontent.com/u/76852793?v=4',
    description: 'An MPC as a service restaking network.',
    tags: [
      'blockchain',
      'mpc',
      'rust',
      'substrate',
      'threshold-signatures',
      'tss',
      'zero-knowledge',
    ],
    readmeUrl: 'https://github.com/webb-tools/tangle/#readme',
    license: {
      name: 'GNU General Public License v3.0',
      url: 'https://api.github.com/licenses/gpl-3.0',
    },
    activityUrl: 'https://github.com/webb-tools/tangle/activity',
    starsCount: 17,
    starsUrl: 'https://github.com/webb-tools/tangle/stargazers',
    watchersCount: 2,
    watchersUrl: 'https://github.com/webb-tools/tangle/watchers',
    forksCount: 7,
    forksUrl: 'https://github.com/webb-tools/tangle/forks',
    releasesCount: 31,
    latestRelease: '0.5.0',
    latestReleaseUrl:
      'https://github.com/webb-tools/tangle/releases/tag/v5.0.0',
    releasesUrl: 'https://github.com/webb-tools/tangle/releases',
    contributorsCount: 13,
    topContributors: Array(13).fill({
      name: '1xstj',
      avatarUrl: 'https://avatars.githubusercontent.com/u/106580853?v=4',
      profileUrl: 'https://github.com/1xstj',
    }) satisfies TopContributorType[],
    contributorsUrl: 'https://github.com/webb-tools/tangle/graphs/contributors',
    languagesInfo: {
      TypeScript: {
        percentage: 52.9,
        color: languageColors.TypeScript,
      },
      Rust: {
        percentage: 44.9,
        color: languageColors.Rust,
      },
      Solidity: {
        percentage: 1.5,
        color: languageColors.Solidity,
      },
      JavaScript: {
        percentage: 0.4,
        color: languageColors.JavaScript,
      },
      Shell: {
        percentage: 0.1,
        color: languageColors.Shell,
      },
      Nix: {
        color: languageColors.Nix,
        percentage: 0.1,
      },
      Dockerfile: {
        color: languageColors.Dockerfile,
        percentage: 0.1,
      },
    },
  } satisfies ProjectGitHubInfoContainerDataType;
}
