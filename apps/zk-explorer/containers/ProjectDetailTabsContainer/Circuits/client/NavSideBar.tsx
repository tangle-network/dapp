import { type FC, useMemo } from 'react';
import cx from 'classnames';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from 'react-complex-tree';
import { Typography } from '@webb-tools/webb-ui-components';
import {
  FileLine,
  FolderFill,
  FolderOpenFill,
  ShieldedCheckLineIcon,
  SideBarLine,
} from '@webb-tools/icons';
import 'react-complex-tree/lib/style-modern.css';

import type {
  FileType,
  GetProjectCircuitDataReturnType,
} from '../../../../server';

interface NavSideBarProps {
  filesData: GetProjectCircuitDataReturnType;
  handleFileSelect: (fileIdx: string) => void;
  activeFileIndex?: string;
  isCollapsed?: boolean;
}

const NavSideBar: FC<NavSideBarProps> = ({
  filesData,
  handleFileSelect,
  activeFileIndex,
  isCollapsed,
}) => {
  const expandedTreeItems = useMemo(
    () =>
      activeFileIndex
        ? getExpandedFoldersFromActiveFileIndex(activeFileIndex)
        : undefined,
    [activeFileIndex]
  );

  return (
    <div className="p-2">
      {/* Header */}
      <div
        className={cx('flex items-center', { 'justify-center': isCollapsed })}
      >
        <div className="p-2">
          <SideBarLine className="dark:!fill-mono-0" />
        </div>
        {!isCollapsed && (
          <Typography
            variant="body2"
            fw="bold"
            className="!text-mono-200 dark:!text-mono-0"
          >
            Files
          </Typography>
        )}
      </div>

      {/* Files Tree */}
      <div className={cx({ hidden: isCollapsed })}>
        <UncontrolledTreeEnvironment<FileType>
          dataProvider={new StaticTreeDataProvider(filesData)}
          getItemTitle={(item) => item.data.fileName}
          canSearch={false}
          canSearchByStartingTyping={false}
          onFocusItem={(item) => {
            if (!item.isFolder) {
              handleFileSelect(item.index.toString());
            }
          }}
          viewState={{
            'file-tree': {
              expandedItems: expandedTreeItems,
              selectedItems: activeFileIndex ? [activeFileIndex] : undefined,
            },
          }}
          renderItemTitle={({ item, context }) => (
            <div className="w-full flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex items-center gap-2">
                {item.isFolder ? (
                  context.isExpanded ? (
                    <FolderOpenFill className="!fill-mono-120" />
                  ) : (
                    <FolderFill className="!fill-mono-120" />
                  )
                ) : (
                  <FileLine className="!fill-mono-120" />
                )}
                <Typography variant="body2" className="text-ellipsis">
                  {item.data.fileName}
                </Typography>
              </div>
              <div>
                {item.data.isTrustedSetup && (
                  <ShieldedCheckLineIcon className="!fill-mono-120" />
                )}
              </div>
            </div>
          )}
          renderItemArrow={({ item, context }) =>
            item.isFolder ? (
              <div
                className="rct-tree-item-arrow-isFolder rct-tree-item-arrow"
                {...context.arrowProps}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  className={cx({
                    '-rotate-90': !context.isExpanded,
                  })}
                >
                  <path
                    d="M8.10201 8.78126L11.4019 5.48145L12.3447 6.42425L8.10201 10.6669L3.85938 6.42425L4.80219 5.48145L8.10201 8.78126Z"
                    fill="#6C7180"
                  />
                </svg>
              </div>
            ) : null
          }
        >
          <Tree treeId="file-tree" rootItem="root" />
        </UncontrolledTreeEnvironment>
      </div>
    </div>
  );
};

export default NavSideBar;

/** @internal */
function getExpandedFoldersFromActiveFileIndex(activeFileIndex: string) {
  const split = activeFileIndex.split('/');
  const expandedFolders: string[] = [];
  for (let i = 1; i < split.length; i++) {
    expandedFolders.push(split.slice(0, i).join('/'));
  }
  return expandedFolders;
}
