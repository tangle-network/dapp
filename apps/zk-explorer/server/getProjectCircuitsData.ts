export type CircuitItemFileType = {
  index: string;
  isFolder?: boolean;
  children: string[];
  fileName: string;
  fullPath?: string;
  isTrustedSetup?: boolean;
  gitHubUrl?: string;
};

export type GetProjectCircuitDataReturnType = Record<
  string,
  CircuitItemFileType
>;

export default async function getProjectCircuitsData(): Promise<GetProjectCircuitDataReturnType> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    root: {
      index: 'root',
      isFolder: true,
      children: ['child1', 'child2'],
      fileName: 'Root item',
    },
    child1: {
      index: 'child1',
      children: [],
      fileName: 'ecdsa_verify.circom',
      fullPath: 'ecdsa_verify.circom',
      isTrustedSetup: true,
      gitHubUrl: 'https://github.com/webb-tools/tangle/forks',
    },
    child2: {
      index: 'child2',
      isFolder: true,
      children: ['child3'],
      fileName: 'ChildItem2',
    },
    child3: {
      index: 'child3',
      children: [],
      fileName: 'ChildItem3',
      fullPath: '/ChildItem2/ChildItem3',
      isTrustedSetup: true,
      gitHubUrl: 'https://github.com/webb-tools/tangle/forks',
    },
  };
}
