import { AnimatePresence } from 'framer-motion';
import React, { cloneElement, createElement, FC, ReactElement, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { HashRouter as Router, useLocation, useRoutes } from 'react-router-dom';

import { StoreData, usePageTitle } from './store';

/* HOC for set page title */
const withTitle = (component: RouterConfigData['element'], title: string): FC => {
  const Inner: FC = () => {
    usePageTitle({ content: title });

    return component || null;
  };

  return Inner;
};

export interface RouterConfigData {
  children?: RouterConfigData[];
  element?: ReactElement;
  path: string;
  redirectTo?: string;
  title?: string;
}

export const Redirect: FC<{ to: string }> = ({ to }) => {
  const navigate = useNavigate();

  useEffect(() => navigate(to), [navigate, to]);

  return null;
};

interface Props {
  config: RouterConfigData[];
  setTitle?: StoreData['ui']['setTitle'];
}

const Routes: FC<Props> = ({ config }) => {
  const location = useLocation();
  const _config = useMemo(() => {
    const inner = config.slice();

    inner.forEach((item) => {
      // process redirect
      if (item.redirectTo) {
        item.element = <Redirect to={item.redirectTo} />;
      }

      if (item.title && item.element) {
        item.element = createElement(withTitle(item.element, item.title));
      }
    });

    return inner;
  }, [config]);

  const element = useRoutes(_config, { ...location, key: location.pathname });

  return <AnimatePresence exitBeforeEnter>{element};</AnimatePresence>;
};

export const RouterProvider: FC<Props> = ({ config }) => {
  const _config = useMemo<RouterConfigData[]>(() => {
    const inner = config.slice();

    inner.forEach((item) => {
      // process second level route
      if (item.children) {
        item.element = cloneElement(item.element as ReactElement, { children: <Routes config={item.children} /> });
      }

      // process redirect
      if (item.redirectTo) {
        item.element = <Redirect to={item.redirectTo} />;
      }
    });

    return inner;
    /* eslint-disable-next-line  react-hooks/exhaustive-deps */
  }, [config]);

  return useMemo(
    (): JSX.Element => (
      <Router>
        <Routes config={_config} />
      </Router>
    ),
    [_config]
  );
};
