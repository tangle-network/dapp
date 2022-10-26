import styled from 'styled-components';
import React, { FC } from 'react';

import { SocialItem } from './types';

const SocialPlatformRoot = styled.div<{ collapse: boolean }>`
  display: flex;
  flex-direction: ${({ collapse }): string => (collapse ? 'column' : 'row')};
  justify-content: space-evenly;
  margin-bottom: 60px;
`;

export const IconLink = styled.a`
  color: #fff;
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.06em;
  white-space: nowrap;

  path {
    fill: #b6b6b6;
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
  width: 28px;
  height: 28px;
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
