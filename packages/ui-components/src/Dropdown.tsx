import React, { memo, FC, ReactNode, useState, createRef, useEffect } from 'react';
import clsx from 'clsx';

// import { Dropdown as AntDropdown } from 'antd';

import { ReactComponent as ArrowIcon } from './assets/arrow-down.svg';
import classes from './Dropdown.module.scss';
import { BareProps } from './types';

export interface DropdownConfig {
  value: any;
  render: () => ReactNode;
}

interface Props extends BareProps {
  size?: 'small' | 'normal';
  value?: any;
  onChange: (value: string | any) => void;
  placeholder?: string;
  config: DropdownConfig[];
  error?: boolean;
  border?: boolean;
  menuClassName?: string;
  itemClassName?: string;
  arrowClassName?: string;
  activeContentClassName?: string;
  selectedRender?: (value: any) => ReactNode;
  compareFN?: (a: any, b: any) => boolean;
}

export const Dropdown: FC<Props> = memo(({
  activeContentClassName,
  arrowClassName,
  border = true,
  className,
  compareFN,
  config,
  itemClassName,
  menuClassName,
  onChange,
  placeholder,
  selectedRender,
  size = 'normal',
  value
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const $rootRef = createRef<HTMLDivElement>();
  const active = config.find((data: DropdownConfig) => compareFN ? compareFN(data.value, value) : data.value === value);

  useEffect(() => {
    if (!$rootRef.current) {
      return;
    }

    const $root = $rootRef.current;

    $root.querySelectorAll('li').forEach(($item): void => {
      $item.style.height = getComputedStyle($root).height;
    });
  }, [$rootRef]);

  const closeMenu = (): void => {
    setOpen(false);
  };

  const toggleMenu = (): void => {
    setOpen(!open);
  };

  const onItemSelect = (value: string): void => {
    onChange(value);
    closeMenu();
  };

  const renderSelected = (): ReactNode => {
    if (!active) {
      return placeholder;
    }

    if (selectedRender) {
      return selectedRender(active.value);
    }

    return active.render();
  };

  return (
    <div
      className={
        clsx(classes.root,
          className,
          {
            [classes.open]: open,
            [classes.small]: size === 'small',
            [classes.border]: border,
            [classes.normal]: !border
          }
        )
      }
      ref={$rootRef}
    >
      <div
        className={classes.activeRoot}
        onClick={toggleMenu}
      >
        <div className={clsx(classes.activeContent, activeContentClassName)}>
          {renderSelected()}
        </div>
        <div className={clsx(classes.arrow, arrowClassName)}>
          <ArrowIcon />
        </div>
      </div>
      <ul className={clsx(classes.menu, menuClassName)}>
        {config.map((item: DropdownConfig): ReactNode => {
          return (
            <li
              className={clsx(classes.menuItem, itemClassName)}
              key={`dropdown-${item.value}`}
              onClick={(): void => onItemSelect(item.value)}
            >
              {item.render()}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';
