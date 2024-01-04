import type { TreeItem } from 'react-complex-tree';

export type FileType = {
  fileName: string;
  fullPath: string;
  isTrustedSetup?: boolean;
  gitHubUrl?: string;
};

export type FileTreeItem = TreeItem<FileType>;

export type GetProjectCircuitDataReturnType = Record<string, FileTreeItem>;

export default async function getProjectCircuitsData(): Promise<GetProjectCircuitDataReturnType> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
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
        gitHubUrl: 'https://github.com/webb-tools/tangle/forks',
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
        gitHubUrl: 'https://github.com/webb-tools/tangle/forks',
      },
    },
  };
}
