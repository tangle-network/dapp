'use client';

import { type FC, useMemo, useState, useEffect } from 'react';
import cx from 'classnames';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SkeletonLoader } from '@webb-tools/webb-ui-components';

import CodeFile from './CodeFile';
import Header from './Header';
import NavSideBar from './NavSideBar';

import type {
  GetProjectCircuitDataReturnType,
  CircuitItemFileType,
} from '../../../../server';

type CircuitsClientProps = {
  data: GetProjectCircuitDataReturnType;
};

const CircuitsClient: FC<CircuitsClientProps> = ({ data }) => {
  const activeFileInit = useMemo(
    () => Object.values(data).find((item) => !item.isFolder),
    [data]
  );

  const [isMounting, setIsMounting] = useState(true);
  const [activeFile, setActiveFile] = useState<CircuitItemFileType | undefined>(
    activeFileInit
  );
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  return (
    <div className="bg-mono-20 dark:bg-mono-200 rounded-2xl h-[100%] flex flex-col">
      <Header activeFile={activeFile} isLoading={isMounting} />

      {isMounting ? (
        <div className="flex-[1_1_auto] flex">
          <div className="space-y-3 p-3 h-full w-[30%]">
            <SkeletonLoader size="xl" />
            <SkeletonLoader size="xl" />
          </div>
          <div className="space-y-3 p-3 h-full w-[70%] border-l-2 border-mono-180">
            <SkeletonLoader size="xl" />
            <SkeletonLoader size="xl" />
          </div>
        </div>
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
            <NavSideBar isCollapsed={sideBarCollapsed} />
          </Panel>
          <PanelResizeHandle
            className={cx(
              'w-[2px] bg-mono-180 ease-linear duration-150',
              'hover:bg-blue-70 dark:hover:bg-blue-50',
              'data-[resize-handle-active]:bg-blue-70 dark:data-[resize-handle-active]:bg-blue-50'
            )}
          />
          <Panel>
            <CodeFile />
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
};

export default CircuitsClient;
