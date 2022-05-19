import { MenuItem } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import React from 'react';
import styled from 'styled-components';

const HeadlessDropdownWrapper = styled.div<any>`
  && {
    min-height: 36px !important;
    min-width: 150px;
    background: transparent;
  }

  .dropdown-box {
    background: transparent;

    width: 36px;
    height: 36px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-right: auto;
  }

  ${Text as any} {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;
type Item = {
  value: string | undefined;
  label: string;
};
type HeadlessDropdownProps<T extends Item = Item> = {
  items: T[];
  renderItem?(item: T): JSX.Element;
  selected?: Item;
  Anchor: React.ComponentType<{
    onClick(event: React.MouseEvent<HTMLButtonElement>): void;
    ['aria-haspopup']: any;
  }>;
  onChange?(item: T): void;
};

const HeadlessDropdown = <T extends Item>({
  Anchor,
  items,
  onChange,
  renderItem,
  selected,
}: HeadlessDropdownProps<T>): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = React.useState(true && !!anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Anchor aria-haspopup='true' onClick={handleClick} />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && open} onClose={handleClose}>
        {items.map((item) => {
          return (
            <MenuItem
              onClick={() => {
                handleClose();
                onChange && onChange(item);
              }}
              style={{
                minWidth: anchorEl ? anchorEl.offsetWidth : 'unset',
              }}
              className='text-capitalize'
              selected={selected && item.value === selected.value}
              key={item.value + 'lang options'}
              value={item.value}
            >
              {renderItem ? renderItem(item) : item.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
export default HeadlessDropdown;
