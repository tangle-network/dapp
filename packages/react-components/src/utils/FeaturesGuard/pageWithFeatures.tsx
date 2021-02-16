import { useFeatures } from '@webb-dapp/react-hooks';
import { Col, Information, Row } from '@webb-dapp/ui-components';
import { AppFeatures } from '@webb-dapp/ui-components/types';
import React from 'react';

type PageConfig = {
  features: AppFeatures[];
  message?: string;
  title?: string;
};

export const pageWithFeatures = <T extends object>({ features, message, title }: PageConfig) => (
  Component: React.ComponentType<T>
): React.ComponentType<T> => (props) => {
  const isSupported = useFeatures(features);

  if (isSupported) {
    return <Component {...props} />;
  }

  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        <Information
          variant={'warning'}
          content={
            message || "This feature isn't supported on the current chain, please consider change the current network"
          }
          title={title || "Page isn't supported on the current chain"}
        />
      </Col>
    </Row>
  );
};
