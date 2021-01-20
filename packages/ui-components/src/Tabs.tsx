import React, { FC, ReactNode, useState, useMemo, Children, ReactElement, useRef, Dispatch, SetStateAction, createRef, isValidElement, useLayoutEffect } from 'react';

import { BareProps } from './types';
import styled from 'styled-components';
import { Motion, spring } from 'react-motion';

function useTabs<T = string | number> (defaultTab: T): { currentTab: T; changeTabs: Dispatch<SetStateAction<T>>} {
  const [currentTab, changeTabs] = useState<T>(defaultTab);

  return useMemo(() => ({
    changeTabs,
    currentTab
  }), [currentTab, changeTabs]);
}

interface PanelProps extends BareProps {
  header: string | ReactElement | ((active: boolean, disabled?: boolean, onClick?: () => void) => ReactNode);
  $key: string | number;
  disabled?: boolean;
}

export const Panel: FC<PanelProps> = () => null;

const TabContainer = styled.div`
  width: 100%;
`;

export const TabHeaderContainer = styled.ul<{ divider: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  list-style: none;
  border-bottom: ${({ divider }): string => divider ? '1px solid var(--tab-border)' : 'none'};
`;

export const TabHeader = styled.li<{
  active: boolean;
  disabled?: boolean;
}>`
  position: relative;
  flex-shink: 0;
  flex-grow: 0;
  padding: 16px 8px;
  margin: 0 58px 0 0;
  font-size: var(--text-size-md);
  font-weight: var(--text-weight-md);
  line-height: 1.3125;
  color: ${({ active }): string => active ? 'var(--color-primary)' : 'var(--text-color-normal)'};
  user-select: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% + 58px);
    height: 100%;
    transition: opacity 0.2s;
    background: var(--color-primary);
    opacity: 0;
    cursor: ${({ disabled }): string => disabled ? 'not-allowed' : 'pointer'};
  }

  &:hover::after {
    opacity: 0.2;
  }
`;

export const CardTabHeader = styled.div<{
  active: boolean;
  disabled?: boolean;
}>`
  flex: 1;
  text-align: center;
  font-size: var(--text-size-lg);
  line-height: 1.1875;
  padding: 20px 0;
  font-weight: 500;
  background: ${({ active }): string => active ? '#ffffff' : '#ECF0F2'};
  cursor: ${({ disabled }): string => disabled ? 'not-allowed' : 'pointer'};
`;

const Slider = styled.div`
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--color-primary);
`;

const ActiveSlider: FC<{ index: number }> = ({ index }) => {
  const ref = createRef<HTMLDivElement>();
  const prevIndex = useRef<number>(0);
  const [prevLeft, setPrevLeft] = useState<number>(0);
  const [currentLeft, setCurrentLeft] = useState<number>(0);
  const [prevWidth, setPrevWidth] = useState<number>(0);
  const [currentWidth, setCurrentWidth] = useState<number>(0);

  useLayoutEffect(() => {
    if (!ref) return;

    const $dom = ref.current;

    // get and set dom position information
    const $container = $dom?.parentNode;
    const $headerList = $container?.querySelectorAll('li');

    if (!$headerList?.length) return;

    setPrevWidth($headerList[prevIndex.current]?.clientWidth ?? 0);
    setCurrentWidth($headerList[index]?.clientWidth ?? 0);
    setPrevLeft($headerList[prevIndex.current]?.offsetLeft ?? 0);
    setCurrentLeft($headerList[index]?.offsetLeft ?? 0);

    // update prev index
    prevIndex.current = index;
  }, [ref, index]);

  // doesn't show animation when first render
  if (prevWidth === 0 && prevLeft === 0) {
    return (
      <Slider
        ref={ref}
        style={{ left: currentLeft + 'px', width: currentWidth + 'px' }}
      />
    );
  }

  return (
    <Motion
      defaultStyle={{ left: prevLeft, width: prevWidth }}
      style={{ left: spring(currentLeft), width: spring(currentWidth) }}
    >
      {
        (style): JSX.Element => {
          return (
            <Slider
              ref={ref}
              style={{ left: style.left + 'px', width: style.width + 'px' }}
            />
          );
        }
      }
    </Motion>
  );
};

const TabContent = styled.div`
  margin-top: 24px;
`;

interface TabsProps<T> extends BareProps {
  className?: string;
  tabClassName?: string;
  active: T | string | number;
  onChange?: ((key: T | string | number) => void) | React.Dispatch<React.SetStateAction<T>>;
  divider?: boolean;
  slider?: boolean;
}

function Tabs<T> ({
  active,
  children,
  divider = true,
  onChange,
  slider = true
}: TabsProps<T>): JSX.Element {
  const [headerList, panelList, keyList, disabledList] = useMemo(() => {
    if (!children) return [[], [], [], []];

    const headerList: ReactNode[] = [];
    const panelList: ReactNode[] = [];
    const disabledList: boolean[] = [];
    const keyList: T[] = [];

    Children.forEach(children, (child) => {
      if (child && typeof child === 'object' && Reflect.has(child, 'key')) {
        headerList.push((child as ReactElement<PanelProps>).props.header);
        panelList.push((child as ReactElement<PanelProps>).props.children);
        keyList.push((child as ReactElement<PanelProps>).props.$key as unknown as T);
        disabledList.push(!!(child as ReactElement<PanelProps>).props.disabled);
      }
    });

    return [headerList, panelList, keyList, disabledList] as unknown as [ReactNode[], ReactNode[], T[], boolean[]];
  }, [children]);

  const activeTabIndex = useMemo(() => {
    return keyList?.findIndex((item) => item === active) ?? 0;
  }, [keyList, active]);

  const firstKey = useMemo(() => keyList[0], [keyList]);

  return (
    <TabContainer>
      <TabHeaderContainer
        className='tab__header__root'
        divider={divider}
      >
        {
          headerList?.map((header, index) => (
            isValidElement(header) ? header
              : typeof header === 'function' ? header(
                activeTabIndex === index,
                disabledList[activeTabIndex],
                (): unknown => !disabledList[index] && onChange && onChange(keyList ? keyList[index] : firstKey)
              ) : <TabHeader
                active={activeTabIndex === index}
                disabled={disabledList[index]}
                key={`tab-${header}-${index}`}
                onClick={(): unknown => !disabledList[index] && onChange && onChange(keyList ? keyList[index] : firstKey) }
              >
                {header}
              </TabHeader>
          ))
        }
        {slider ? <ActiveSlider index={activeTabIndex} /> : null}
      </TabHeaderContainer>
      <TabContent>
        {panelList[activeTabIndex]}
      </TabContent>
    </TabContainer>
  );
}

Tabs.Panel = Panel;

export { useTabs, Tabs };
