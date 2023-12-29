'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import {
  Children,
  FC,
  ReactNode,
  cloneElement,
  isValidElement,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { TabsContext, useTabs } from '../hooks/useTabs';
import { SmallChip } from './SmallChip';

export type Tab = {
  name: string;
  count?: number;
};

export type TabsProps = {
  initiallySelectedTabIndex?: number;
  tabs: Tab[];
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  onTabChange?: (tab: Tab, index: number) => void;
};

type TabsContentProps = {
  children: ReactNode;
  index?: number;
};

interface TabsType extends FC<TabsProps> {
  Content: FC<TabsContentProps>;
}

/**
 * Provides a flexible way to manage tabs with or without attached content.
 *
 * @remarks
 * Tabs can optionally include a count chip to be displayed next to the tab name.
 * At least one tab must be provided, otherwise there would be nothing to render.
 *
 * @example
 * Providing content as children:
 * ```tsx
 * <Tabs
 *   tabs={[{ name: 'Overview' }, { name: 'Settings' }]}
 * >
 *   <Tabs.Content>first</Tabs.Content>
 *   <Tabs.Content>second</Tabs.Content>
 * </Tabs>
 * ```
 *
 * @example
 * Managing content outside of the component, using the `onTabChange` callback:
 * ```tsx
 * const [selectedTab, setSelectedTab] = useState(0);
 *
 * // ...
 *
 * <Tabs
 *   tabs={[{ name: 'Overview' }, { name: 'Settings' }]}
 *   onTabChange={(tab, index) => setSelectedTab(index)}
 * />
 *
 * // ...
 *
 * {selectedTab === 0 && <div>first</div>}
 * ```
 */
export const Tabs: TabsType = ({
  initiallySelectedTabIndex = 0,
  tabs,
  children,
  rightContent,
  onTabChange,
}) => {
  assert(
    initiallySelectedTabIndex >= 0 && initiallySelectedTabIndex < tabs.length,
    'Selected tab index is out of range'
  );

  assert(
    tabs.length > 0,
    'At least one tab must be provided, otherwise there would be nothing to render'
  );

  const [selectedTabIndex, setSelectedTabIndex] = useState(
    initiallySelectedTabIndex
  );

  const value = { selectedTabIndex, setSelectedTabIndex };

  const handleTabChangeAttempt = (tab: Tab, index: number) => {
    // Do nothing if the tab is already selected.
    if (selectedTabIndex === index) {
      return;
    }

    setSelectedTabIndex(index);

    if (onTabChange !== undefined) {
      onTabChange(tab, index);
    }
  };

  const enhancedChildren = Children.map(children, (child, index) => {
    // TODO: Assert amount of child tab content elements (if at least one is present) is equal to the amount of tabs.
    // TODO: Consider whether disallowing other elements apart from tab content is a good idea.

    if (isValidElement<TabsContentProps>(child) && child.type === TabsContent) {
      const childProps = { ...child.props, index } satisfies TabsContentProps;

      return cloneElement(child, childProps);
    }

    return child;
  });

  return (
    <TabsContext.Provider value={value}>
      <div className="flex gap-6 sm:gap-0 align-center flex-col sm:flex-row">
        {/* Tabs */}
        <div className="inline-flex gap-4 w-full">
          {tabs.map((tab, index) => {
            const isSelected = index === selectedTabIndex;

            return (
              <div
                key={index}
                className={twMerge(
                  'flex justify-center items-center gap-2 py-1 border-b-2 border-transparent w-full sm:w-auto sm:justify-start',
                  isSelected
                    ? 'border-mono-200 dark:border-mono-0'
                    : 'cursor-pointer'
                )}
                onClick={() => handleTabChangeAttempt(tab, index)}
              >
                <Typography
                  variant="h5"
                  fw="bold"
                  className={
                    isSelected
                      ? 'dark:text-mono-0'
                      : 'text-mono-100 dark:text-mono-100'
                  }
                >
                  {tab.name}
                </Typography>

                {tab.count !== undefined && <SmallChip>{tab.count}</SmallChip>}
              </div>
            );
          })}
        </div>

        {rightContent}
      </div>

      {enhancedChildren}
    </TabsContext.Provider>
  );
};

export const TabsContent: FC<TabsContentProps> = ({ children, index }) => {
  const { selectedTabIndex } = useTabs();

  return selectedTabIndex === index ? <div>{children}</div> : null;
};

// Attach `Content` to `Tabs` for convenience.
Tabs.Content = TabsContent;
