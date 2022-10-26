import { AlertVariant } from '../types';
import { ErrorIcon } from './Error';
import { InfoIcon } from './Info';
import { SuccessIcon } from './Success';
import { WarningIcon } from './Warning';

export * from './Error';
export * from './Info';
export * from './Success';
export * from './Warning';

export const IconByVariant: React.FC<{ variant: AlertVariant }> = ({ variant }) => {
  switch (variant) {
    case 'error': {
      return <ErrorIcon />;
    }
    case 'success': {
      return <SuccessIcon />;
    }
    case 'warning': {
      return <WarningIcon />;
    }
    case 'info':
    default: {
      return <InfoIcon />;
    }
  }
};
