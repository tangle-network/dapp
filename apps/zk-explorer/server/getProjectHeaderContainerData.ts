type ProjectHeaderContainerDataType = {
  name: string;
  owner: string;
  tags: string[];
  githubUrl: string;
  twitterUrl?: string;
  websiteUrl?: string;
  discordUrl?: string;
};

export default async function getProjectHeaderContainerData(): Promise<ProjectHeaderContainerDataType> {
  await new Promise((r) => setTimeout(r, 1000));

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
