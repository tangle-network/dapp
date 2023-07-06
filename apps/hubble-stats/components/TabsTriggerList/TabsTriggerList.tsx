import { FC } from 'react';
import cx from 'classnames';
import {
  TabsList,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';

interface TabsProps {
  tabs: string[];
}

export const TabsTriggerList: FC<TabsProps> = ({ tabs }) => {
  return (
    <TabsList className="space-x-4">
      {tabs.map((tab, idx) => {
        return (
          <TabTrigger
            key={idx}
            value={tab}
            isDisableStyle
            className={cx(
              'text-mono-100 radix-state-active:text-mono-200',
              'dark:radix-state-active:!text-mono-0'
            )}
          >
            <Typography
              variant="mkt-body2"
              fw="black"
              className="!text-current"
            >
              {tab}
            </Typography>
          </TabTrigger>
        );
      })}
    </TabsList>
  );
};
