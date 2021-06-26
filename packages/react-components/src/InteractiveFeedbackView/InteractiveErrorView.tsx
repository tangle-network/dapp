import { Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { FeedbackEntry, InteractiveFeedback } from '@webb-dapp/react-environment';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useMemo } from 'react';
import styled from 'styled-components';

const InteractiveErrorViewWrapper = styled.div`
  padding: 0.5rem 2rem;
`;
type InteractiveErrorViewProps = {
  activeFeedback: InteractiveFeedback | null;
};

/// list of know error codes of the dApp
export enum WebbErrorCodes {
  /// Unsupported chain is switch via the extension
  UnsupportedChain,
  /// Attempt to find a mixer size on a contract
  MixerSizeNotFound,
  /// No accounts are available
  NoAccountAvailable,
  /// Failed to parse deposit note
  NoteParsingFailure,
}

/// An Error message with error metadata
type WebbErrorMessage = {
  message: string;
  code: WebbErrorCodes;
};

/// WebbError an Error class to throw errors and catch them with type
export class WebbError extends Error {
  /// Static `Map` for error messages that will be instilled lazily
  static errorMessageMap: Map<WebbErrorCodes, WebbErrorMessage> = new Map();
  /// error message for this error
  readonly errorMessage: WebbErrorMessage;

  constructor(readonly code: WebbErrorCodes) {
    super(WebbError.getErrorMessage(code).message);
    this.errorMessage = WebbError.getErrorMessage(code);
  }

  /// create a `WebbError` from the error code
  static from(code: WebbErrorCodes) {
    return new WebbError(code);
  }

  /// Static method to ge the error of the map if it's there , or create it and append the map
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
      case WebbErrorCodes.NoAccountAvailable:
        return {
          code,
          message: 'No account available',
        };
      case WebbErrorCodes.NoteParsingFailure:
        return {
          code,
          message: 'Failed to parse deposit note',
        };
      default:
        return {
          code,
          message: 'Unknown error',
        };
    }
  }

  /// Coercion to sting
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
              <Padding x={2} v={1}>
                <ul>
                  {entry[key]?.map((entry) => {
                    return (
                      <li>
                        <Typography>{entry}</Typography>
                      </li>
                    );
                  })}
                </ul>
              </Padding>
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
