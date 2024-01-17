import { TreeItem } from 'react-complex-tree';
import { ProjectItem } from '../components/ProjectCard';
import { DEBUG_ARTIFICIAL_DELAY_MS } from '../constants';
import {
  MOCK_FILE_TREE,
  MOCK_PROJECT_BASIC_INFO,
  MOCK_PROJECT_DETAILS_SUMMARY,
  MOCK_PROJECT_GITHUB_INFO,
  MOCK_PROJECT_TRUSTED_SETUP_DATA,
} from '../constants/mock';
import { artificialDelay, getGitHubLanguageColors } from '../utils';

export type ContributionListItem = {
  doc: string;
  contributionDate: string;
  hashes: string;
};

export type ProjectTrustedSetupItem = {
  name: string;
  gitHubUrl: string;
  tags: string[];
  finalZKey: {
    filename: string;
    downloadUrl: string;
  };
  contributionList?: ContributionListItem[];
};

export type ProjectBasicInfo = {
  name: string;
  owner: string;
  tags: string[];
  githubUrl: string;
  twitterUrl?: string;
  websiteUrl?: string;
  discordUrl?: string;
};

export type FileType = {
  fileName: string;
  fullPath: string;
  isTrustedSetup?: boolean;
  gitHubUrl?: string;
  fetchUrl?: string;
  language?: string;
};

export type FileTreeItem = TreeItem<FileType>;

export type FileTree = Record<string, FileTreeItem>;

export async function fetchProjectTrustedSetupData(): Promise<
  ProjectTrustedSetupItem[]
> {
  // TODO: This should perform an API request to fetch the data from the backend.

  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

  return MOCK_PROJECT_TRUSTED_SETUP_DATA;
}

export async function fetchProjectDetailsSummary(): Promise<string> {
  // TODO: This should perform an API request to fetch the data from the backend.
  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

  return MOCK_PROJECT_DETAILS_SUMMARY;
}

export type TopContributorType = {
  name: string;
  avatarUrl: string;
  profileUrl: string;
};

export type ProjectDetailsGitHubInfo = {
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

export async function fetchProjectGitHubInfo(): Promise<ProjectDetailsGitHubInfo> {
  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

  const languageColors = await getGitHubLanguageColors([
    'TypeScript',
    'Rust',
    'Solidity',
    'JavaScript',
    'Shell',
    'Nix',
    'Dockerfile',
  ]);

  return MOCK_PROJECT_GITHUB_INFO(languageColors);
}

export async function fetchProjectBasicInfo(): Promise<ProjectBasicInfo> {
  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

  return MOCK_PROJECT_BASIC_INFO;
}

export async function fetchRelatedProjects(): Promise<ProjectItem[]> {
  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

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

export async function fetchProjectFileTree(): Promise<FileTree> {
  await artificialDelay(DEBUG_ARTIFICIAL_DELAY_MS);

  return MOCK_FILE_TREE;
}
