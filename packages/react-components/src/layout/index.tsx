import { useStore } from '@webb-dapp/react-environment';
import { useApi, useIsAppReady, useSetting, useTranslation } from '@webb-dapp/react-hooks';
import { Alert, Page, PageLoading, styled } from '@webb-dapp/ui-components';
import { noop } from 'lodash';
import React, { FC, memo, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SidebarConfig } from '../Sidebar';
import AppBar from '@webb-dapp/react-components/AppBar/AppBar';
import { BottomNavigation } from '@webb-dapp/react-components/BottomNavigation/BottomNavigation';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';

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

const Main: FC<MainLayoutProps> = memo(({ children, enableCollapse = true, sidebar }) => {
  const { t } = useTranslation('react-components');
  const { init } = useApi();
  const { allEndpoints, endpoint } = useSetting();
  const isAppReady = useIsAppReady();
  const ui = useStore('ui');
  const navigate = useNavigate();

  useEffect(() => {
    if (!endpoint) return;

    if (isAppReady) return;

    // initialize api
    init(endpoint, allEndpoints);
  }, [init, endpoint, allEndpoints, isAppReady]);

  const breadcrumb = useMemo(() => {
    if (ui.breadcrumb.length === 0) return [];

    return [
      ...ui.breadcrumb.map((item) => ({
        ...item,
        onClick: (): void => {
          navigate(item.path);
        },
      })),
      {
        content: ui.pageTitle,
        onClick: noop,
      },
    ];
  }, [ui.breadcrumb, navigate, ui.pageTitle]);

  const content = useMemo(() => {
    if (!isAppReady) return <PageLoading />;

    return (
      <Page>
        <Page.Content>{children}</Page.Content>
      </Page>
    );
  }, [isAppReady, t, breadcrumb, ui.subMenu, ui.pageTitle, children]);
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
