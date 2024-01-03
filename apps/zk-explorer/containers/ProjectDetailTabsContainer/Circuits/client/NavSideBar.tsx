import { type FC } from 'react';
import cx from 'classnames';
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from 'react-complex-tree';
import { Typography } from '@webb-tools/webb-ui-components';
import {
  ChevronDown,
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
          // disableMultiselect={true}
          onFocusItem={(item) => {
            if (!item.isFolder) {
              handleFileSelect(item.index.toString());
            }
          }}
          viewState={{
            'file-tree': {
              expandedItems: activeFileIndex
                ? getExpandedFoldersFromActiveFileIndex(activeFileIndex)
                : undefined,
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
                // {...context.interactiveElementProps.onClick}
              >
                <ChevronDown
                  className={cx({
                    '-rotate-90': !context.isExpanded,
                  })}
                  enableBackground="new 0 0 16 16"
                  xmlSpace="preserve"
                />
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
