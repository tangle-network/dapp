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
      contributionList: [
        {
          doc: 'pairing_20_00001.zkey',
          contributionDate: 'Dec 11,2023',
          hashes:
            'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
        },
        {
          doc: 'pairing_20_00002.zkey',
          contributionDate: 'Dec 11,2023',
          hashes:
            'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
        },
        {
          doc: 'pairing_20_00003.zkey',
          contributionDate: 'Dec 11,2023',
          hashes:
            'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
        },
      ],
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
