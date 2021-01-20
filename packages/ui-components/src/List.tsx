import React, { ReactNode, FC } from 'react';
import { BareProps } from './types';
import clsx from 'clsx';
import './List.scss';

type ListStyle = 'list';

interface ItemProps extends BareProps {
  label: string | ReactNode;
  value: string | ReactNode;
}

const Item: FC<ItemProps> = ({
  className,
  label,
  value
}) => {
  return (
    <li className={clsx('aca-list__item', className)}>
      <div>{label}</div>
      <div>{value}</div>
    </li>
  );
};

interface ListProps extends BareProps{
  style?: ListStyle;
}

type ListComponent = FC<ListProps> & { Item: FC<ItemProps> };

const _List: FC<ListProps> = ({
  children,
  className,
  style
}) => {
  return (
    <ul className={clsx(className, 'aca-list', `aca-list--style-${style}`)}>
      {children}
    </ul>
  );
};

(_List as any).Item = Item;

export const List = _List as ListComponent;
