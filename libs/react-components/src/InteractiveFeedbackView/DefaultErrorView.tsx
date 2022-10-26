import { Button, Typography } from '@mui/material';
import { FeedbackEntry, InteractiveFeedback } from '@nepoche/dapp-types';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import React, { useMemo } from 'react';
import styled from 'styled-components';

const DefaultErrorViewWrapper = styled.div`
  padding: 0.5rem 2rem;
  font-size: 1rem !important;
  .text {
    font-size: 1rem !important;
  }
`;

type DefaultErrorViewProps = {
  activeFeedback: InteractiveFeedback;
};

const DefaultErrorView: React.FC<DefaultErrorViewProps> = ({ activeFeedback }) => {
  const pallet = useColorPallet();

  const actions = useMemo(() => {
    return Object.keys(activeFeedback.actions).map((name, idx) => (
      <Button
        style={{
          fontSize: '.9rem',
          color: pallet[activeFeedback?.actions[name].level as any] || pallet.primaryText,
        }}
        onClick={() => {
          activeFeedback?.trigger(name);
        }}
        key={`${name}${idx}`}
      >
        {name}
      </Button>
    ));
  }, [activeFeedback, pallet]);

  const elements = useMemo(() => {
    return activeFeedback.feedbackBody.map((entry, idx) => {
      const key = Object.keys(entry)[0] as keyof FeedbackEntry;
      const commonProps = {
        key: `${key}${idx}`,
      };

      switch (key) {
        case 'content':
          return (
            <Padding x={0} v={0.5} {...commonProps}>
              <Typography className={'text'}>{entry[key]}</Typography>
            </Padding>
          );

        case 'json':
          return (
            <Typography className={'text'} {...commonProps}>
              <pre>{entry['json'] as unknown as React.ReactNode}</pre>
            </Typography>
          );

        case 'header':
          return (
            <Typography variant={'h3'} {...commonProps}>
              <pre>{entry[key]}</pre>
            </Typography>
          );

        case 'any':
          return <div {...commonProps}>{entry[key]?.() ?? null}</div>;

        case 'list':
          return (
            <Padding x={2.5} v={0.25} {...commonProps}>
              <ul>
                {entry[key]?.map((entry) => {
                  return (
                    <li key={entry}>
                      <Typography className={'text'}>{entry}</Typography>
                    </li>
                  );
                })}
              </ul>
            </Padding>
          );
      }
    });
  }, [activeFeedback]);

  return (
    <>
      <DefaultErrorViewWrapper>{elements}</DefaultErrorViewWrapper>
      <Padding v x={2}>
        <Flex row ai={'center'} jc='flex-end'>
          {actions}
          <Button
            onClick={() => {
              activeFeedback?.cancel();
            }}
          >
            Cancel
          </Button>
        </Flex>
      </Padding>
    </>
  );
};

export default DefaultErrorView;
