import type { TreeItem } from 'react-complex-tree';
import { DEBUG_ARTIFICIAL_DELAY_MS } from '../constants';
import { artificialWait } from '../utils';

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

export default async function fetchFileTree(): Promise<FileTree> {
  await artificialWait(DEBUG_ARTIFICIAL_DELAY_MS);

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
}
