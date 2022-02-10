import AppBar from '@webb-dapp/react-components/AppBar/AppBar';
import { BottomNavigation } from '@webb-dapp/react-components/BottomNavigation/BottomNavigation';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { Page, styled } from '@webb-dapp/ui-components';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { FC, memo, useMemo, useState } from 'react';
import { Sidebar } from '..';

import { SidebarConfig } from '../Sidebar/types';

const MainContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--platform-background);
`;
const ContentWrapper = styled.main`
  display: flex;
  flex: 1;
  flex-grow: 1;
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

const Main: FC<MainLayoutProps> = memo(({ children, sidebar }) => {
  const [sidebarDisplay, setSidebarDisplay] = useState<boolean>(false);

  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    if (width <= size.md && sidebarDisplay) {
      setSidebarDisplay(false);
    }
    if (width > size.md && !sidebarDisplay) {
      setSidebarDisplay(true);
    }

    return width <= size.sm;
  }, [width, size]);

  const content = useMemo(() => {
    return (
      <Page>
        <Page.Content>{children}</Page.Content>
      </Page>
    );
  }, [children]);
  return ( isMobile ?
    <div style={{ overflow: 'hidden' }}>
      <Sidebar collapse={!sidebarDisplay} isMobile={true} config={sidebar} setSidebarDisplay={setSidebarDisplay}/>
      <MainContainer>
        <AppBar toggleSidebarDisplay={() => setSidebarDisplay(!sidebarDisplay)}/>
        <ContentWrapper>{content}</ContentWrapper>
        {/*<BottomNavigation />*/}
      </MainContainer>
    </div>
    :
    <div style={{display: 'flex'}}>
      <Sidebar collapse={false} isMobile={false} config={sidebar} setSidebarDisplay={()=>{}}/>
      <MainContainer>
        <AppBar toggleSidebarDisplay={() => setSidebarDisplay(!sidebarDisplay)}/>
        <ContentWrapper>{content}</ContentWrapper>
        {/*<BottomNavigation />*/}
      </MainContainer>
    </div>
  );
});

Main.displayName = 'Main';

const Layout = { Main };

export { Layout };
