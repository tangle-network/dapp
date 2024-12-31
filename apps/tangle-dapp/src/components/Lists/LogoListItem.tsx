import {
  EMPTY_VALUE_PLACEHOLDER,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

type Props = {
  logo: ReactNode;
  leftUpperContent: ReactNode | string;
  leftBottomText?: ReactNode;
  rightUpperText?: ReactNode;
  rightBottomText?: ReactNode;
};

const LogoListItem: FC<Props> = ({
  logo,
  leftUpperContent,
  leftBottomText,
  rightUpperText,
  rightBottomText,
}) => {
  return (
    <>
      <div className="flex items-center gap-3">
        {logo}

        <div className="flex flex-col">
          {typeof leftUpperContent === 'string' ? (
            <Typography
              variant="body1"
              fw="bold"
              className="block text-mono-200 dark:text-mono-0"
            >
              {leftUpperContent}
            </Typography>
          ) : (
            leftUpperContent
          )}

          {leftBottomText !== undefined && (
            <Typography
              variant="body1"
              className="block text-mono-140 dark:text-mono-120"
            >
              {leftBottomText}
            </Typography>
          )}
        </div>
      </div>

      {rightUpperText !== undefined && rightBottomText !== undefined && (
        <div className="flex flex-col items-end justify-center">
          <Typography variant="body1">
            {rightUpperText ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          {rightBottomText !== undefined && (
            <Typography
              variant="body1"
              className="block text-mono-140 dark:text-mono-120"
            >
              {rightBottomText}
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default LogoListItem;
