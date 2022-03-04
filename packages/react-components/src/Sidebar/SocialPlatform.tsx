import { styled } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

import { SocialItem } from './types';

const SocialPlatformRoot = styled.div<{ collapse: boolean }>`
  display: flex;
  width: 150px;
  flex-direction: ${({ collapse }): string => (collapse ? 'column' : 'row')};
  justify-content: space-around;
  margin-bottom: 60px;
  padding: 0 24px;
`;

export const IconLink = styled.a`
  color: #fff;
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.06em;
  white-space: nowrap;

  path {
    fill: #B6B6B6;
  }

  transition: all 0.3s ease-in-out;

  &:hover {
    text-decoration: none;
    path {
      fill: ${({ theme }) => theme.accentColor};
    }
  }
`;

const SocialIcon = styled.div`
  display: flex;
  justify-content: 'space-between';
  align-items: center;
  width: 25px;
  height: 25px;
`;

export const SocialLink: React.FC<{
  to: string;
  title: string;
  Icon: React.ReactNode;
}> = ({ Icon, title, to }) => {
  return (
    <IconLink target='_blank' href={to} title={title}>
      <SocialIcon>{Icon}</SocialIcon>
    </IconLink>
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
        <SocialLink
          to={item.href}
          title={item.name || `social-unknown`}
          Icon={item.icon}
          key={`social-platform-${item.href}`}
        />
      ))}
    </SocialPlatformRoot>
  );
};
