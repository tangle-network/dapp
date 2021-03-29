import { useStore } from '@webb-dapp/react-environment';
import { useApi, useBreakpoint, useFetch, useIsAppReady, useSetting, useTranslation } from '@webb-dapp/react-hooks';
import { Alert, Page, PageLoading, styled, SubMenu } from '@webb-dapp/ui-components';
import { noop } from 'lodash';
import React, { FC, memo, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';

import { AccountBar } from '../AccountBar';
import { SidebarConfig } from '../Sidebar';
import AppBar from '@webb-dapp/react-components/AppBar/AppBar';

const CAlert = styled(Alert)`
  margin-top: 32px;
`;

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
`;

const AppNav = styled.nav`
  min-height: 65px;
  width: 100%;
  max-width: 1440px;
  margin: auto;
  display: flex;
  flex: 1;
  align-items: center;
`;

interface MainLayoutProps {
  sidebar: SidebarConfig;
  enableCollapse?: boolean;
}

const Main: FC<MainLayoutProps> = memo(({ children, enableCollapse = true, sidebar }) => {
  const { t } = useTranslation('react-components');
  const { init } = useApi();
  const result = useFetch('https://api.myip.com');
  const { allEndpoints, endpoint } = useSetting();
  const screen = useBreakpoint();
  const isAppReady = useIsAppReady();
  const ui = useStore('ui');
  const collapse = useMemo(() => (enableCollapse ? !(screen.xl ?? true) : false), [enableCollapse, screen]);
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
    </MainContainer>
  );
});

Main.displayName = 'Main';

const Layout = { Main };

export { Layout };
