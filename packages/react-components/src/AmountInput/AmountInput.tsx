import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';

type AmountItem = {
  id: string | number;
  amount: number;
};
const AmountInputWrapper = styled.div`
  display: flex;
  align-items: center;
`;
type AmountInputProps = {
  items: AmountItem[];
  value?: AmountItem;
  onChange?(item: AmountItem): void;
};

const AmountItem = styled.label`
  flex: 1;
  color: var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  .label__amount-wrapper {
    display: block;
    cursor: pointer;
  }

  position: relative;
  :after,
  :before {
    content: '';
    transition: width 0.3s ease;
    background: var(--color-primary);
    position: absolute;
    top: 19px;
    height: 5px;
    width: 0;
  }
  :before {
    left: 0;
  }
  &.is-first {
    :before {
      display: none;
    }
  }

  :after {
    right: 0;
  }
  &.is-selected {
    :after,
    :before {
      width: calc(50% - 11px);
    }
  }
  &.is-last {
    :after {
      display: none;
    }
  }
`;
const Radio = styled.input`
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  background: transparent;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
  padding: 0;
  margin: 0;
  outline: none;
  box-shadow: none;
  border: none;

  :before,
  :after {
    content: '';
    display: block;
    position: absolute;
  }
  :after {
    top: 8px;
    left: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--color-primary);
    z-index: 44;
  }
  :before {
    top: 13px;
    left: 13px;
    width: 14px;
    height: 14px;
    background: var(--color-primary);
    border-radius: 50%;
  }
  :not(:checked) {
    :before {
      background: transparent;
    }
  }
`;
const AmountInput: React.FC<AmountInputProps> = ({ onChange, items, value }) => {
  const checkedIndex = useMemo(() => {
    return items.findIndex((item) => item.id === value?.id);
  }, [value, items]);
  useEffect(() => {
    if (!value && onChange) {
      onChange(items[1]);
    }
  }, [value]);
  return (
    <AmountInputWrapper>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === checkedIndex;
        const isSelected = index <= checkedIndex;
        const id = `amount-${item.id}`;
        return (
          <AmountItem
            htmlFor={id}
            className={clsx({
              ['is-first']: isFirst,
              ['is-last']: isLast,
              ['is-selected']: isSelected,
            })}
            key={id}
          >
            <Radio
              onChange={() => {
                console.log('checkedIndex');
                if (onChange) {
                  onChange(item);
                }
              }}
              id={id}
              name={'amount'}
              value={value?.id}
              type={'radio'}
              checked={value?.id === item.id}
            />
            <span className={`label__amount-wrapper`}>{item.amount}</span>
          </AmountItem>
        );
      })}
    </AmountInputWrapper>
  );
};
export default AmountInput;
