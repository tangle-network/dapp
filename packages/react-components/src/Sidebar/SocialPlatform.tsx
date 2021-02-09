import { styled } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

import { SocialItem } from './types';

const SocialPlatformRoot = styled.div<{ collapse: boolean }>`
  display: flex;
  flex-direction: ${({ collapse }): string => (collapse ? 'column' : 'row')};
  margin-bottom: 60px;
  padding: 0 24px;
`;

const SocialPlatformItemRoot = styled.a<{ collapse: boolean }>`
  margin-right: 12px;
  padding: 0;
  width: 24px;
  height: 24px;
  margin-top: ${({ collapse }): number => (collapse ? 16 : 0)}px;

  &:hover {
    transform: scale(1.1);
    background: none;
  }

  & svg {
    margin: 0;
  }
`;

interface SocialPlatformItemProps {
  data: SocialItem;
  collapse: boolean;
}

const SocialPlatformItem: FC<SocialPlatformItemProps> = ({ collapse, data }) => {
  return (
    <SocialPlatformItemRoot collapse={collapse} href={data.href} rel={data.rel} target='_blank'>
      {data.icon}
    </SocialPlatformItemRoot>
  );
};

interface SocialPlatformProps {
  collapse: boolean;
  data: SocialItem[];
}

export const SocialPlatform: FC<SocialPlatformProps> = ({ collapse, data }) => {
  return (
    <SocialPlatformRoot collapse={collapse}>
      {data.map((item) => (
        <SocialPlatformItem collapse={collapse} data={item} key={`social-platform-${item.href}`} />
      ))}
    </SocialPlatformRoot>
  );
};
