import React, { useMemo } from 'react';
import styled from 'styled-components';
import { FeedbackEntry, InteractiveFeedback } from '@webb-dapp/react-environment';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import Typography from '@material-ui/core/Typography';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Button } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';

const InteractiveErrorViewWrapper = styled.div`
  padding: 0.5rem 2rem;
`;
type InteractiveErrorViewProps = {
  activeFeedback: InteractiveFeedback | null;
};

export enum WebbErrorCodes {
  UnsupportedChain,
  MixerSizeNotFound,
}

type WebbErrorMessage = {
  message: string;
  code: WebbErrorCodes;
};

export class WebbError extends Error {
  static errorMessageMap: Map<WebbErrorCodes, WebbErrorMessage> = new Map();
  readonly errorMessag: WebbErrorMessage;

  constructor(readonly code: WebbErrorCodes) {
    super(WebbError.getErrorMessage(code).message);
    this.errorMessag = WebbError.getErrorMessage(code);
  }

  static from(code: WebbErrorCodes) {
    return new WebbError(code);
  }

  static getErrorMessage(code: WebbErrorCodes): WebbErrorMessage {
    const errorMessage = WebbError.errorMessageMap.get(code);
    if (errorMessage) {
      return errorMessage;
    }
    switch (code) {
      case WebbErrorCodes.UnsupportedChain:
        return {
          code,
          message: 'you have switched to unsupported chain',
        };
      case WebbErrorCodes.MixerSizeNotFound:
        return {
          code,
          message: 'Mixer size not found in contract',
        };
      default:
        return {
          code,
          message: 'Unknown error',
        };
    }
  }

  toString() {
    return this.message;
  }
}

const InteractiveErrorView: React.FC<InteractiveErrorViewProps> = ({ activeFeedback }) => {
  const pallet = useColorPallet();
  const actions = useMemo(() => {
    if (activeFeedback) {
      return Object.keys(activeFeedback.actions).map((name) => (
        <Button
          style={{
            // @ts-ignore
            color: pallet[activeFeedback?.actions[name].level as any] || pallet.primaryText,
          }}
          onClick={() => {
            activeFeedback?.actions[name].onTrigger();
          }}
        >
          {name}
        </Button>
      ));
    }
  }, [activeFeedback, pallet]);
  const elements = useMemo(() => {
    if (activeFeedback) {
      return activeFeedback.feedbackBody.map((entry) => {
        const key = Object.keys(entry)[0] as keyof FeedbackEntry;
        switch (key) {
          case 'content':
            return <Typography>{entry[key]}</Typography>;
          case 'json':
            return (
              <Typography>
                <pre>{entry[key]}</pre>
              </Typography>
            );
          case 'header':
            return (
              <Typography variant={'h4'}>
                <pre>{entry[key]}</pre>
              </Typography>
            );
          case 'list':
            return (
              <ul>
                {entry[key]?.map((entry) => {
                  return <li>{entry}</li>;
                })}
              </ul>
            );
        }
      });
    }
  }, [activeFeedback]);
  return (
    <Modal open={Boolean(activeFeedback)}>
      <InteractiveErrorViewWrapper>{elements}</InteractiveErrorViewWrapper>
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
    </Modal>
  );
};
export default InteractiveErrorView;
