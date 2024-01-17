import { randomBytes } from 'crypto';
import {
  Location,
  MpcParticipant,
} from '../components/ProofGenerationStepCards/types';
import {
  FilterCategoryItem,
  FilterOptionItem,
} from '../containers/Filters/types';
import { User } from '../hooks/useAuth';
import {
  FileTree,
  ProjectBasicInfo,
  ProjectDetailsGitHubInfo,
  ProjectTrustedSetupItem,
  TopContributorType,
} from '../server/projectDetails';

export const MOCK_PROOF_SYSTEMS_OPTIONS: FilterOptionItem[] = [
  {
    label: 'Circom',
    amount: 403,
  },
  {
    label: 'Plonk',
    amount: 123,
  },
  {
    label: 'Halo2',
    amount: 234,
  },
  {
    label: 'Bulletproof',
    amount: 43,
  },
  {
    label: 'Stark',
    amount: 78,
  },
];

export const MOCK_CATEGORY_OPTIONS: FilterOptionItem[] = [
  {
    label: 'Identity Verification',
    amount: 59,
  },
  {
    label: 'Private Transaction',
    amount: 290,
  },
  {
    label: 'Voting System',
    amount: 12,
  },
  {
    label: 'Arithmetic',
    amount: 90,
  },
  {
    label: 'Cryptography',
    amount: 183,
  },
];

export const MOCK_LICENSE_OPTIONS: FilterOptionItem[] = [
  {
    label: 'MIT',
    amount: 392,
  },
  {
    label: 'GPLv3',
    amount: 19,
  },
  {
    label: 'Apache 2.0',
    amount: 128,
  },
];

export const MOCK_LANGUAGE_OPTIONS: FilterOptionItem[] = [
  {
    label: 'TypeScript',
    amount: 410,
  },
  {
    label: 'C++',
    amount: 319,
  },
  {
    label: 'Rust',
    amount: 593,
  },
  {
    label: 'Circom',
    amount: 478,
  },
  {
    label: 'Solidity',
    amount: 92,
  },
  {
    label: 'JavaScript',
    amount: 228,
  },
];

export const MOCK_CATEGORIES: FilterCategoryItem[] = [
  {
    category: 'Proof System',
    options: MOCK_PROOF_SYSTEMS_OPTIONS,
  },
  {
    category: 'Categories',
    options: MOCK_CATEGORY_OPTIONS,
  },
  {
    category: 'License',
    options: MOCK_LICENSE_OPTIONS,
  },
  {
    category: 'Language/Framework',
    options: MOCK_LANGUAGE_OPTIONS,
  },
];

export const MOCK_USER: User = {
  id: '0',
  email: 'hello@webb.tools',
  twitterHandle: 'webbprotocol',
  githubUsername: 'webb',
  website: 'https://www.webb.tools/',
  shortBio:
    'An ecosystem of infrastructures and applications designed to extend privacy to the blockchain space.',
  createdAt: new Date().getTime() - 1000 * 60 * 60 * 24 * 7,
  activatedCircuitCount: 0,
};

export const MOCK_MPC_PARTICIPANTS: MpcParticipant[] = Array.from(
  { length: 5 },
  () => ({
    address: randomBytes(20).toString('hex'),
    location: Location.UsWest,
    slashingIncidents: 0,
    uptime: 100,
  })
);

export const MOCK_CIRCUIT_FILE_PATH = 'pairing.circom';

export const MOCK_PROJECT_TRUSTED_SETUP_DATA: ProjectTrustedSetupItem[] = [
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
        hashes: 'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
      },
      {
        doc: 'pairing_20_00002.zkey',
        contributionDate: 'Dec 11,2023',
        hashes: 'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
      },
      {
        doc: 'pairing_20_00003.zkey',
        contributionDate: 'Dec 11,2023',
        hashes: 'ca1288cf4e67294c2298ca1288cf4e67294c2298ca1288cf4e67294c2298',
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

export const MOCK_PROJECT_DETAILS_SUMMARY = `
  # A demo of \`react-markdown\`

  \`react-markdown\` is a markdown component for React.

  👉 Changes are re-rendered as you type.

  👈 Try writing some markdown on the left.

  ## Overview

  * Follows [CommonMark](https://commonmark.org)
  * Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)
  * Renders actual React elements instead of using \`dangerouslySetInnerHTML\`
  * Lets you define your own components (to render \`MyHeading\` instead of \`'h1'\`)
  * Has a lot of plugins

  ## Contents

  Here is an example of a plugin in action
  ([\`remark-toc\`](https://github.com/remarkjs/remark-toc)).
  **This section is replaced by an actual table of contents**.

  ## Syntax highlighting

  Here is an example of a plugin to highlight code:
  [\`rehype-highlight\`](https://github.com/rehypejs/rehype-highlight).

  \`\`\`js
  import React from 'react'
  import ReactDOM from 'react-dom'
  import Markdown from 'react-markdown'
  import rehypeHighlight from 'rehype-highlight'

  const markdown = \`
  # Your markdown here
  \`

  ReactDOM.render(
    <Markdown rehypePlugins={[rehypeHighlight]}>{markdown}</Markdown>,
    document.querySelector('#content')
  )
  \`\`\`

  Pretty neat, eh?

  ## GitHub flavored markdown (GFM)

  For GFM, you can *also* use a plugin:
  [\`remark-gfm\`](https://github.com/remarkjs/react-markdown#use).
  It adds support for GitHub-specific extensions to the language:
  tables, strikethrough, tasklists, and literal URLs.

  These features **do not work by default**.
  👆 Use the toggle above to add the plugin.

  | Feature    | Support              |
  | ---------: | :------------------- |
  | CommonMark | 100%                 |
  | GFM        | 100% w/ \`remark-gfm\` |

  ~~strikethrough~~

  * [ ] task list
  * [x] checked item

  https://example.com

  ## HTML in markdown

  ⚠️ HTML in markdown is quite unsafe, but if you want to support it, you can
  use [\`rehype-raw\`](https://github.com/rehypejs/rehype-raw).
  You should probably combine it with
  [\`rehype-sanitize\`](https://github.com/rehypejs/rehype-sanitize).

  <blockquote>
    👆 Use the toggle above to add the plugin.
  </blockquote>

  ## Components

  You can pass components to change things:

  \`\`\`js
  import React from 'react'
  import ReactDOM from 'react-dom'
  import Markdown from 'react-markdown'
  import MyFancyRule from './components/my-fancy-rule.js'
import { ProjectDetailsGitHubInfo } from "../server/projectDetails";

  const markdown = \`
  # Your markdown here
  \`

  ReactDOM.render(
    <Markdown
      components={{
        // Use h2s instead of h1s
        h1: 'h2',
        // Use a component instead of hrs
        hr(props) {
          const {node, ...rest} = props
          return <MyFancyRule {...rest} />
        }
      }}
    >
      {markdown}
    </Markdown>,
    document.querySelector('#content')
  )
  \`\`\`

  ## More info?

  Much more info is available in the
  [readme on GitHub](https://github.com/remarkjs/react-markdown)!

  ***

  A component by [Espen Hovlandsdal](https://espen.codes/)
`;

export const MOCK_PROJECT_GITHUB_INFO = (
  languageColors: Record<string, string>
): ProjectDetailsGitHubInfo =>
  ({
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
  } satisfies ProjectDetailsGitHubInfo);

export const MOCK_PROJECT_BASIC_INFO: ProjectBasicInfo = {
  name: 'tangle',
  owner: 'webb-tools',
  tags: ['groth16', 'circom', 'private transaction'],
  githubUrl: 'https://github.com/webb-tools/tangle',
  twitterUrl: 'https://twitter.com/webbprotocol',
  websiteUrl: 'https://webb.tools',
  discordUrl: 'https://discord.com/invite/cv8EfJu3Tn',
};

export const MOCK_FILE_TREE: FileTree = {
  root: {
    index: 'root',
    isFolder: true,
    children: ['circuits'],
    data: {
      fileName: '',
      fullPath: '',
    },
  },
  circuits: {
    index: 'circuits',
    isFolder: true,
    children: ['circuits/file1', 'circuits/folder'],
    data: {
      fileName: 'circuits',
      fullPath: 'circuits',
    },
  },
  ['circuits/file1']: {
    index: 'circuits/file1',
    children: [],
    data: {
      fileName: 'file1.circom',
      fullPath: 'circuits/file1.circom',
      isTrustedSetup: true,
      gitHubUrl:
        'https://github.com/webb-tools/masp-protocol/blob/main/circuits/main/batch_tree_16.circom',
      fetchUrl:
        'https://raw.githubusercontent.com/webb-tools/webb-dapp/develop/apps/zk-explorer/app/page.tsx',
      language: 'tsx',
    },
  },
  ['circuits/folder']: {
    index: 'circuits/folder',
    isFolder: true,
    children: ['circuits/folder/file2'],
    data: {
      fileName: 'folder',
      fullPath: 'circuits/folder',
    },
  },
  ['circuits/folder/file2']: {
    index: 'circuits/folder/file2',
    children: [],
    data: {
      fileName: 'file2.circom',
      fullPath: 'circuits/folder/file2.circom',
      isTrustedSetup: true,
      gitHubUrl:
        'https://github.com/webb-tools/masp-protocol/blob/main/circuits/merkle-tree/manyMerkleProof.circom',
      fetchUrl:
        'https://raw.githubusercontent.com/webb-tools/webb-dapp/develop/apps/zk-explorer/app/layout.tsx',
      language: 'tsx',
    },
  },
};
