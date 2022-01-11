import { useFeatures } from '@webb-dapp/react-hooks';
import { Information } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { AppFeatures } from '@webb-dapp/ui-components/types';
import React from 'react';

type PageConfig = {
  features: AppFeatures[];
  message?: string;
  title?: string;
};

export const pageWithFeatures =
  <T extends object>({ features, message, title }: PageConfig) =>
    (Component: React.ComponentType<T>): React.ComponentType<T> =>
      (props) => {
        const isSupported = useFeatures(features);

        if (isSupported) {
          return <Component {...props} />;
        }

        return (
          <Flex row>
            <Flex flex={1}>
              <Information
                variant={'warning'}
                content={
                  message ||
              "This feature isn't supported on the current chain, please consider changing the current network"
                }
                title={title || "Page isn't supported on the current chain"}
              />
            </Flex>
          </Flex>
        );
      };
