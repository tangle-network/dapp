import AppBar from '@webb-dapp/react-components/AppBar/AppBar';
import { BottomNavigation } from '@webb-dapp/react-components/BottomNavigation/BottomNavigation';
import { Page, styled } from '@webb-dapp/ui-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { FC, memo, useMemo } from 'react';

import { SidebarConfig } from '../Sidebar/types';

const MainContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--platform-background);
  flex-direction: column;
`;
const ContentWrapper = styled.main`
  display: flex;
  flex: 1;
  max-height: calc(100vh - 110px);
  overflow: hidden;
  ${above.sm`
    max-height: calc(100vh - 65px);
	`}
`;

interface MainLayoutProps {
  sidebar: SidebarConfig;
  enableCollapse?: boolean;
}

const Main: FC<MainLayoutProps> = memo(({ children }) => {
  const content = useMemo(() => {
    return (
      <Page>
        <Page.Content>{children}</Page.Content>
      </Page>
    );
  }, [children]);
  return (
    <MainContainer>
      <AppBar />
      <ContentWrapper>{content}</ContentWrapper>
      <BottomNavigation />
    </MainContainer>
  );
});

Main.displayName = 'Main';

const Layout = { Main };

export { Layout };
