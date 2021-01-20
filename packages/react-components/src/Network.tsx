import React, { FC, ReactElement } from 'react';
import { ReactComponent as AcalaLogo } from './assets/aca-network.svg';
import { ReactComponent as LaminarLogo } from './assets/laminar-network.svg';
import { ReactComponent as PolkadotLogo } from './assets/polkadot-network.svg';
import classes from './Network.module.scss';

export type NetworkType = 'acala' | 'laminar' | 'rococo' | 'polkadot';

const logoMap = new Map([
  ['acala', <AcalaLogo key='acala-logo' />],
  ['laminar', <LaminarLogo key='laminar-logo' />],
  ['polkadot', <PolkadotLogo key='polkadot-logo' />],
  ['rococo', <PolkadotLogo key='rococo-logo' />]
]);

const nameMap = new Map([
  ['acala', 'Acala'],
  ['laminar', 'Laminar'],
  ['polkadot', 'Polkadot'],
  ['rococo', 'Rococo']
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
