import { useStore } from '@webb-dapp/react-environment';
import { useModal } from '@webb-dapp/react-hooks';
import { ArrowIcon, styled } from '@webb-dapp/ui-components';
import React, { createRef, FC, memo, useCallback, useContext, useEffect } from 'react';
import { NavLink, NavLinkProps, useMatch } from 'react-router-dom';

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
  padding: 21px;
  padding-left: ${({ $hasIcon }): number => ($hasIcon ? 21 : 40)}px;
  height: var(--sidebar-item-height);
  cursor: pointer;

  &:hover,
  &.active {
    background: linear-gradient(90deg, #151414 0%, #0c0c0c 100%) #000;
  }

  &:after {
    content: '';
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
  color: var(--color-primary) !important;
`;

interface ProductListProps {
  collapse: boolean;
}

const ProductList = styled.div<ProductListProps>`
  display: ${(props): string => (props.collapse ? 'none' : 'block')};
`;

const ProductArrow = styled(ArrowIcon)<{ open: boolean }>`
  transform: rotate(${(props): number => (props.open ? -180 : 0)}deg);
  & g {
    stroke: var(--color-primary);
  }
`;

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
    if (!isMatch) return;

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
          <ProductArrow open={isOpen} />
        </ProductCell>
        <ProductList collapse={!isOpen}>
          {data.items.map((item) => (
            <ProductItem collapse={collapse} data={item} key={`${data.name}_${item.name}`} />
          ))}
        </ProductList>
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
