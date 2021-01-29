import React, { FC } from 'react';

import { styled } from '@webb-dapp/ui-components';

import { ReactComponent as WebbIogoSmall } from '../assets/mandala-logo-small.svg';

export const TestNet = styled.div`
  display: inline-block;
  position: relative;
  height: 16px;
  padding: 1px 4px;
  border-radius: 0;
  border-top-left-radius: 4px;
  border-bottom-right-radius: 4px;

  color: var(--color-white);
  font-size: 12px;
  line-height: 14px;
  font-weight: 400;
  overflow: visible;
  background: var(--color-red-light);

  &:after {
    content: '';
    position: absolute;
    left: -4px;
    bottom: 0;
    border-style: solid;
    border-width: 0 4px 4px 4px;
    border-color: transparent transparent var(--color-red-light) transparent;
  }
`;

interface LogoProps {
  collapse: boolean;
}

const CTestNet = styled(TestNet)`
  margin-bottom: 10px;
`;

const LogoRoot = styled.div<LogoProps>`
  padding: 0 ${({ collapse }): number => (collapse ? 0 : 30)}px;
  margin-top: ${({ collapse }): number => (collapse ? 20 : 68)}px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Logo: FC<LogoProps> = ({ collapse }) => {
  return (
    <LogoRoot collapse={collapse}>
      <CTestNet>TestNet</CTestNet>
      {collapse ? <WebbIogoSmall /> : <WebbIogoSmall />}
    </LogoRoot>
  );
};
