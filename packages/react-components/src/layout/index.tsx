import AppBar from '@webb-dapp/react-components/AppBar/AppBar';
import { BottomWalletSelection } from '@webb-dapp/react-components/BottomWalletSelection/BottomWalletSelection';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { Page, styled } from '@webb-dapp/ui-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { FC, memo, useEffect, useMemo, useState } from 'react';

import { SidebarConfig } from '../Sidebar/types';
import { Sidebar } from '..';

const MainContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  background: var(--platform-background);
`;
const ContentWrapper = styled.main`
  display: flex;
  flex: 1;
  flex-grow: 1;
  max-height: calc(100vh - 110px);
  ${above.sm`
    max-height: calc(100vh - 65px);
	`}
`;

interface MainLayoutProps {
  sidebar: SidebarConfig;
  enableCollapse?: boolean;
}

const Main: FC<MainLayoutProps> = memo(({ children, sidebar }) => {
  const [sidebarDisplay, setSidebarDisplay] = useState<boolean>(false);

  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    return width <= size.sm;
  }, [width, size]);

  const content = useMemo(() => {
    return (
      <Page>
        <Page.Content>{children}</Page.Content>
      </Page>
    );
  }, [children]);

  // Always set sidebar display to false when resized to larger screens
  useEffect(() => {
    if (!isMobile && sidebarDisplay) {
      setSidebarDisplay(false);
    }
  }, [isMobile, sidebarDisplay]);

  return isMobile ? (
    <div>
      <Sidebar collapse={!sidebarDisplay} isMobile={true} config={sidebar} setSidebarDisplay={setSidebarDisplay} />
      <MainContainer>
        <AppBar toggleSidebarDisplay={() => setSidebarDisplay(!sidebarDisplay)} />
        <ContentWrapper>{content}</ContentWrapper>
        <BottomWalletSelection />
      </MainContainer>
    </div>
  ) : (
    <div style={{ display: 'flex' }}>
      <Sidebar collapse={false} isMobile={false} config={sidebar} setSidebarDisplay={() => {}} />
      <MainContainer>
        <AppBar toggleSidebarDisplay={() => setSidebarDisplay(!sidebarDisplay)} />
        <ContentWrapper>{content}</ContentWrapper>
      </MainContainer>
    </div>
  );
});

Main.displayName = 'Main';

const Layout = { Main };

export { Layout };
