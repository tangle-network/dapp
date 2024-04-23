import { useState } from 'react';

import type { NodeSpecification } from '../types';

const mock: NodeSpecification = {
  os: 'Linux',
  version: '0.6.1-721ffa6-x86_64-linux-gnu',
  cpuCores: 6,
  memory: 6,
  isVirtualMachine: false,
  linuxDistribution: 'ubuntu 22.04.3 lts',
  linuxKernel: '5.4.0-150-generic',
};

const useNodeSpecifications = (_: string) => {
  // TODO: handle validatorAddress
  // console.log('validatorAddress :', validatorAddress);
  const [nodeSpecifications] = useState<NodeSpecification[]>([mock]);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    isLoading,
    error,
    data: { nodeSpecifications },
  };
};

export default useNodeSpecifications;
