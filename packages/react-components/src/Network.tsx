import React, { FC, ReactElement } from 'react';
import { ReactComponent as EdgewareLogo } from './assets/edgeware-network.svg';
import classes from './Network.module.scss';

export type NetworkType = 'edgeware' | 'beresheet';

const logoMap = new Map([
  ['edgeware', <EdgewareLogo key='edgeware-logo' />],
  ['beresheet', <EdgewareLogo key='edgeware-logo' />],
]);

const nameMap = new Map([
  ['edgeware', 'Edgeware'],
  ['beresheet', 'Beresheet'],
]);

export const getNetworkName = (network: NetworkType): string => {
  return nameMap.get(network) || '';
};

export interface NetworkProps {
  type: NetworkType;
}

export const Network: FC<NetworkProps> = ({ type }) => {
  return logoMap.has(type) ? React.cloneElement(logoMap.get(type) as ReactElement, { className: classes.root }) : null;
};
