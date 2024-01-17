'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FileTree } from '../../../../server/projectDetails';
import CodeFile from './CodeFile';
import Header from './Header';
import NavSideBar from './NavSideBar';

type CircuitsClientProps = {
  fileTree: FileTree;
};

const CircuitsClient: FC<CircuitsClientProps> = ({ fileTree }) => {
  const initActiveFileIndex = useMemo(
    () =>
      Object.values(fileTree)
        .find((item) => !item.isFolder)
        ?.index?.toString() ?? undefined,
    [fileTree]
  );

  const [isMounting, setIsMounting] = useState(true);

  const [activeFileIndex, setActiveFileIndex] = useState<string | undefined>(
    initActiveFileIndex
  );

  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);

  const activeFileData = activeFileIndex
    ? fileTree[activeFileIndex].data
    : undefined;

  const handleFileSelect = useCallback((fileIdx: string) => {
    setActiveFileIndex(fileIdx);
  }, []);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  return (
    <div className="bg-mono-20 dark:bg-mono-200 rounded-2xl h-[100%] flex flex-col">
      <Header activeFile={activeFileData} isLoading={isMounting} />

      {isMounting ? (
        <MainSkeleton />
      ) : (
        <PanelGroup direction="horizontal" className="flex-[1_1_auto]">
          <Panel
            collapsible={true}
            collapsedSize={6}
            defaultSize={30}
            minSize={20}
            maxSize={35}
            onCollapse={() => setSideBarCollapsed(true)}
            onExpand={() => setSideBarCollapsed(false)}
          >
            <NavSideBar
              fileTree={fileTree}
              handleFileSelect={handleFileSelect}
              activeFileIndex={activeFileIndex}
              isCollapsed={sideBarCollapsed}
            />
          </Panel>

          <PanelResizeHandle
            className={cx(
              'w-[2px] bg-mono-60 dark:bg-mono-180 ease-linear duration-150',
              'hover:bg-blue-70 dark:hover:bg-blue-50',
              'data-[resize-handle-active]:bg-blue-70 dark:data-[resize-handle-active]:bg-blue-50'
            )}
          />

          <Panel className="!overflow-auto">
            <CodeFile
              fetchUrl={activeFileData?.fetchUrl}
              language={activeFileData?.language}
            />
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
};

/** @internal */
const MainSkeleton: FC = () => {
  return (
    <div className="flex-[1_1_auto] flex">
      <div className="space-y-3 p-3 h-full w-[30%]">
        <SkeletonLoader size="xl" />

        <SkeletonLoader size="xl" />
      </div>

      <div className="space-y-3 p-3 h-full w-[70%] border-l-2 border-mono-60 dark:border-mono-180">
        <SkeletonLoader size="xl" />

        <SkeletonLoader size="xl" />
      </div>
    </div>
  );
};

export default CircuitsClient;
