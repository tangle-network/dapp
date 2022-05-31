import { Button, Typography } from '@material-ui/core';
import { FeedbackEntry, InteractiveFeedback } from '@webb-dapp/api-providers';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
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
    return Object.keys(activeFeedback.actions).map((name) => (
      <Button
        style={{
          fontSize: '.9rem',
          // @ts-ignore
          color: pallet[activeFeedback?.actions[name].level as any] || pallet.primaryText,
        }}
        onClick={() => {
          activeFeedback?.trigger(name);
        }}
      >
        {name}
      </Button>
    ));
  }, [activeFeedback, pallet]);
  const elements = useMemo(() => {
    return activeFeedback.feedbackBody.map((entry) => {
      const key = Object.keys(entry)[0] as keyof FeedbackEntry;
      switch (key) {
        case 'content':
          return (
            <Padding x={0} v={0.5}>
              <Typography className={'text'}>{entry[key]}</Typography>
            </Padding>
          );
        case 'json':
          return (
            <Typography className={'text'}>
              <pre>{entry[key]}</pre>
            </Typography>
          );
        case 'header':
          return (
            <Typography variant={'h3'}>
              <pre>{entry[key]}</pre>
            </Typography>
          );
        case 'any':
          return entry[key]?.() ?? null;
        case 'list':
          return (
            <Padding x={2.5} v={0.25}>
              <ul>
                {entry[key]?.map((entry) => {
                  return (
                    <li>
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
