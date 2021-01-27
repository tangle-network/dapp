import React, { FC, useMemo } from 'react';
import { styled, Step } from '@webb-dapp/ui-components';

const CStep = styled(Step)`
  width: 382px;
  background: var(--platform-background);
  padding: 0;
  font-size: 12px;
  line-height: 1.5;

  .step__item {
    flex-direction: row;
    padding: 0 10px;
    min-width: auto;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }

    &:not(.active) {
      .step__item__point {
        background: #bfbfbf;
        border-color: #bfbfbf;
      }
    }
    .step__item__point {
      width: 8px;
      height: 8px;
    }

    &::before {
      display: none;
    }

    &::after {
      display: none;
    }
  }

  .step__item__text {
    margin: 0;
    padding: 0;
    padding-left: 10px;
  }
`;

export const GovernanceStage: FC = () => {
  const data = useMemo(() => {
    return [
      {
        index: 'poa',
        text: 'PoA',
      },
      {
        index: 'council-governance',
        text: 'Council Governance',
      },
      {
        index: 'democracy',
        text: 'Democracy',
      },
    ];
  }, []);

  return <CStep config={data} current={'poa'} showIndex={false} />;
};
