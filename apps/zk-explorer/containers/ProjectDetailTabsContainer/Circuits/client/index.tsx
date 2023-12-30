'use client';

import { type FC, useMemo, useState } from 'react';

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

  const [activeFile, setActiveFile] = useState<CircuitItemFileType | undefined>(
    activeFileInit
  );

  return (
    <div className="bg-mono-20 dark:bg-mono-200 rounded-2xl h-[100%]">
      <Header activeFile={activeFile} />
    </div>
  );
};

export default CircuitsClient;
