import { Collapse } from '@mui/material';
import { useStore } from '@nepoche/react-environment';
import { useModal } from '@nepoche/ui-hooks';
import { ArrowDownIcon } from '@nepoche/ui-components/assets/ArrowDownIcon';
import { createRef, FC, memo, useCallback, useContext, useEffect } from 'react';
import { NavLink, NavLinkProps, useMatch } from 'react-router-dom';
import styled from 'styled-components';

import { SidebarActiveContext } from './context';
import { ProductItem as IProductItem } from './types';

interface ProductItemProps {
  collapse: boolean;
  data: IProductItem;
}

export const CNavLink = styled(NavLink)<NavLinkProps & { $hasIcon?: boolean }>`
  position: relative;
  display: flex;
  justify-items: flex-start;
  align-items: center;
  padding-left: ${({ $hasIcon }): number => ($hasIcon ? 21 : 40)}px;
  height: var(--sidebar-item-height);
  cursor: pointer;

  &:hover,
  &.active {
    background: ${({ theme }) => theme.lightSelectionBackground};
  }

  &.active span {
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
  }

  &.active svg {
    path {
      fill: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }

  &.active:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    border-radius: 50% 0px 0px 50%;
  }
`;

export const ProductCell = styled.div<{ $hasIcon?: boolean }>`
  position: relative;
  display: flex;
  justify-items: flex-start;
  align-items: center;
  padding: 0 21px;
  padding-left: ${({ $hasIcon }): number => ($hasIcon ? 21 : 40)}px;
  height: 58px;
  cursor: pointer;
`;

const ProductName = styled.span<{ collapse: boolean }>`
  display: ${({ collapse }): string => (collapse ? 'none' : 'block')};
  flex: 1;
  margin-left: 15px;
  font-size: var(--text-size-sm);
  line-height: 20px;
  font-weight: 500;
  color: #b6b6b6;
`;

interface ProductListProps {
  collapse: boolean;
}

const ProductList = styled.div<ProductListProps>`
  display: ${(props): string => (props.collapse ? 'none' : 'block')};
`;

const ProductArrowWrapper = styled.div<{ open: boolean }>`
  transform: rotate(${(props): number => (props.open ? 0 : -90)}deg);
  transition: 300ms linear all;
  & g {
    stroke: var(--color-primary);
  }
`;

const ProductSubItem: FC<ProductItemProps> = memo(({ collapse, data }) => {
  const { setSubMenu } = useStore('ui');
  const ref = createRef<HTMLAnchorElement>();
  const { active, setActive } = useContext(SidebarActiveContext);
  const isMatch = useMatch(data.path ?? '__unset__path');

  const handleClick = useCallback(() => {
    setSubMenu(null);
  }, [setSubMenu]);

  useEffect(() => {
    if (!isMatch) {
      return;
    }

    if (!!isMatch && setActive && data.path && active !== ref.current) {
      setActive(ref.current);
    }
  }, [isMatch, setActive, ref, data, active]);

  return (
    <CNavLink
      $hasIcon={!!data.icon}
      onClick={handleClick}
      ref={ref}
      to={data.path ?? '__unset__path'}
      style={{
        height: '48px',
        paddingLeft: '30px',
      }}
    >
      {data.icon}
      <ProductName collapse={collapse}>{data.name}</ProductName>
    </CNavLink>
  );
});

const ProductItem: FC<ProductItemProps> = memo(({ collapse, data }) => {
  const { setSubMenu } = useStore('ui');
  const { status: isOpen, toggle } = useModal(false);
  const ref = createRef<HTMLAnchorElement>();
  const { active, setActive } = useContext(SidebarActiveContext);
  const isMatch = useMatch(data.path ?? '__unset__path');

  const handleClick = useCallback(() => {
    setSubMenu(null);
  }, [setSubMenu]);

  useEffect(() => {
    if (!isMatch) {
      return;
    }

    if (!!isMatch && setActive && data.path && active !== ref.current) {
      setActive(ref.current);
    }
  }, [isMatch, setActive, ref, data, active]);

  if (data.items) {
    return (
      <>
        <ProductCell $hasIcon={!!data.icon} onClick={toggle}>
          {data.icon}
          <ProductName collapse={collapse}>{data.name}</ProductName>
          <ProductArrowWrapper open={isOpen}>
            <ArrowDownIcon />
          </ProductArrowWrapper>
        </ProductCell>
        <Collapse in={isOpen}>
          <ProductList collapse={!isOpen}>
            {data.items.map((item) => (
              <ProductSubItem collapse={collapse} data={item} key={`${data.name}_${item.name}`} />
            ))}
          </ProductList>
        </Collapse>
      </>
    );
  }

  return (
    <CNavLink $hasIcon={!!data.icon} onClick={handleClick} ref={ref} to={data.path ?? '__unset__path'}>
      {data.icon}
      <ProductName collapse={collapse}>{data.name}</ProductName>
    </CNavLink>
  );
});

ProductItem.displayName = 'ProductItem';

const ProductsRoot = styled.div`
  flex: 1;
  margin-bottom: 24px;
`;

interface ProductsProps {
  data: IProductItem[];
  collapse: boolean;
}

export const Products: FC<ProductsProps> = ({ collapse, data }) => {
  return (
    <ProductsRoot>
      {data.map((item) => (
        <ProductItem collapse={collapse} data={item} key={`product-${item.name}`} />
      ))}
    </ProductsRoot>
  );
};
