import React, { FC, memo, ReactNode } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';

import { BareProps } from './types';
import { ReactComponent as CheckedIcon } from './assets/checked.svg';

export interface StepConfig {
  index: number | string;
  text: ReactNode;
}

interface Props extends BareProps {
  config: StepConfig[];
  current: number | string;
  showIndex?: boolean;
}

const StepRoot = styled.ul`
  padding: 0 16px;
  position: relative;
  display: flex;
  justify-content: space-between;
  list-style: none;
  background: #ffffff;
  font-size: 16px;
  line-height: 19px;
  font-weight: 500;

  &:after {
    content: '';
    position: absolute;
    height: 1px;
    top: calc(50% - 1px);
    left: 16px;
    right: 16px;
    background: #d8d8d8;
  }
`;

const StepItem = styled.li`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: inherit;
  min-width: 120px;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 20%;
    height: 1px;
    top: calc(50% - 1px);
    background: #d8d8d8;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  &:first-child::before {
    display: none;
  }

  &:last-child::after {
    display: none;
  }

  &.active {
    .step__item__point {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #ffffff;
    }
    .step__item__text {
      font-weight: 500;
      color: var(--text-color-primary);
    }
  }

  &.done {
    .step__item__point {
      border-color: var(--color-primary);
      color: var(--color-primary);

      & path {
        fill: var(--color-primary);
      }
    }

    .step__item__text {
      color: var(--text-color-primary);
    }
  }
`;

const Point = styled.span`
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 100%;
  border: 1px solid var(--text-color-second);
  color: var(--text-color-second);
`;

const Text = styled.span`
  margin-top: 16px;
  color: var(--text-color-second);
`;

export const Step: FC<Props> = memo(({
  className,
  config,
  current,
  showIndex = true
}) => {
  const isDone = (index: number): boolean => {
    const currentArrayIndex = config.findIndex((item): boolean => item.index === current);

    return index < currentArrayIndex;
  };

  return (
    <StepRoot className={className}>
      {
        config.map((item, index) => {
          return (
            <StepItem
              className={clsx(
                'step__item',
                {
                  active: item.index === current,
                  done: isDone(index)
                }
              )}
              key={`step-${item.index}-${item.text}`}
            >
              <Point className='step__item__point'>
                {
                  showIndex ? isDone(index) ? (
                    <CheckedIcon />
                  ) : index + 1 : null
                }
              </Point>
              <Text className='step__item__text'>{item.text}</Text>
            </StepItem>
          );
        })
      }
    </StepRoot>
  );
});

Step.displayName = 'Step';
