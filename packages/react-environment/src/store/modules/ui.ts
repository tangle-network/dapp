import { ReactNode, useCallback, useMemo, useReducer } from 'react';

export interface SubMenu {
  content: {
    content: ReactNode;
    key: string;
  }[];
  active: string;
  onClick: (key: string) => void;
}

export type UIData = {
  theme: string;
  subMenu: SubMenu | null;
  pageTitle: ReactNode;
  breadcrumb: { content: string; path: string }[];
}

export type UIAction = { type: 'set_theme'; value: string }
| { type: 'set_page_title'; value: { content: ReactNode; breadcrumb?: UIData['breadcrumb'] } }
| { type: 'set_sub_menu'; value: SubMenu | null };

const initState: UIData = {
  breadcrumb: [],
  pageTitle: '__empty',
  subMenu: null,
  theme: 'primary'
};

const reducer = (state: UIData, action: UIAction): UIData => {
  switch (action.type) {
    case 'set_page_title': {
      return {
        ...state,
        breadcrumb: action.value.breadcrumb ?? [],
        pageTitle: action.value.content
      };
    }

    case 'set_theme': {
      return {
        ...state,
        theme: action.value
      };
    }

    case 'set_sub_menu': {
      return {
        ...state,
        subMenu: action.value
      };
    }
  }
};

export interface UseUIConfigReturnType extends UIData {
  setTitle: (config: { content: ReactNode }) => void;
  setTheme: (theme: string) => void;
  setSubMenu: (menu: SubMenu | null) => void;
}

export const useUIConfig = (): UseUIConfigReturnType => {
  const [state, dispatch] = useReducer(reducer, initState);

  const setTitle = useCallback((config: { content: ReactNode; breadcrumb?: UIData['breadcrumb'] }) => {
    dispatch({
      type: 'set_page_title',
      value: config
    });
  }, [dispatch]);

  const setTheme = useCallback((theme: string) => {
    dispatch({
      type: 'set_theme',
      value: theme
    });
  }, [dispatch]);

  const setSubMenu = useCallback((value: SubMenu | null) => {
    dispatch({
      type: 'set_sub_menu',
      value: value
    });
  }, [dispatch]);

  return useMemo(() => ({
    ...state,
    setSubMenu,
    setTheme,
    setTitle
  }), [state, setTitle, setTheme, setSubMenu]);
};
