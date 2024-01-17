import { DEBUG_ARTIFICIAL_DELAY_MS } from '../constants';
import { artificialWait } from '../utils';

type ProjectHeaderContainerDataType = {
  name: string;
  owner: string;
  tags: string[];
  githubUrl: string;
  twitterUrl?: string;
  websiteUrl?: string;
  discordUrl?: string;
};

export default async function fetchProjectHeaderContainerData(): Promise<ProjectHeaderContainerDataType> {
  await artificialWait(DEBUG_ARTIFICIAL_DELAY_MS);

  return {
    name: 'tangle',
    owner: 'webb-tools',
    tags: ['groth16', 'circom', 'private transaction'],
    githubUrl: 'https://github.com/webb-tools/tangle',
    twitterUrl: 'https://twitter.com/webbprotocol',
    websiteUrl: 'https://webb.tools',
    discordUrl: 'https://discord.com/invite/cv8EfJu3Tn',
  };
}
