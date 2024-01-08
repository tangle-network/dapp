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

export default async function getProjectTrustedSetupData(): Promise<
  ProjectTrustedSetupItem[]
> {
  return [
    {
      name: 'bignit.circom',
      gitHubUrl: 'https://github.com/webb-tools/tangle',
      tags: [
        'groth16',
        'constraints: 452,124',
        'wires: 52124',
        'public inputs: 1',
        'private inputs: 2036',
        'curve: bn-128',
      ],
      finalZKey: {
        filename: 'example_0063.zkey',
        downloadUrl: '#',
      },
    },
    {
      name: 'ecdsa.circom',
      gitHubUrl: 'https://github.com/webb-tools/tangle',
      tags: [
        'groth16',
        'constraints: 452,124',
        'wires: 52124',
        'public inputs: 1',
        'private inputs: 2036',
        'curve: bn-128',
      ],
      finalZKey: {
        filename: 'example_0063.zkey',
        downloadUrl: '#',
      },
    },
    {
      name: 'ecdsa_verify.circom',
      gitHubUrl: 'https://github.com/webb-tools/tangle',
      tags: [
        'groth16',
        'constraints: 452,124',
        'wires: 52124',
        'public inputs: 1',
        'private inputs: 2036',
        'curve: bn-128',
      ],
      finalZKey: {
        filename: 'example_0063.zkey',
        downloadUrl: '#',
      },
    },
  ];
}
