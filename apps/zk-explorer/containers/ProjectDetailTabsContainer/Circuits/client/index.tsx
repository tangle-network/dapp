'use client';

import { type FC, useState } from 'react';

import Header from './Header';
import NavSideBar from './NavSideBar';

import type {
  GetProjectCircuitDataReturnType,
  CircuitItemFileType,
} from '../../../../server';

const CircuitsClient: FC<{ data: GetProjectCircuitDataReturnType }> = ({
  data,
}) => {
  const [activeFile, setActiveFile] = useState<CircuitItemFileType>(
    Object.values(data).filter((item) => !item.isFolder)[0]
  );

  return (
    <div className="bg-mono-200 rounded-2xl h-[100%]">
      <Header activeFile={activeFile} />
    </div>
  );
};

export default CircuitsClient;
