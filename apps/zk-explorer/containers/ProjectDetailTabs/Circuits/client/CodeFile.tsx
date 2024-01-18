import { type FC, useEffect, useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  Button,
  notificationApi,
  Typography,
  SkeletonLoader,
  useNextDarkMode as useDarkMode,
} from '@webb-tools/webb-ui-components';
import { Alert } from '@webb-tools/icons';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeFileProps {
  fetchUrl?: string;
  language?: string;
}

const CodeFile: FC<CodeFileProps> = ({ fetchUrl, language }) => {
  const [isDarkMode] = useDarkMode();
  const [code, setCode] = useState<string | undefined>();
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const fetchCodeFile = useCallback(async () => {
    if (!fetchUrl) return;
    setIsLoadingCode(true);
    try {
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const code = await res.text();
        setCode(code);
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        notificationApi({
          variant: 'error',
          message: 'Cannot load file',
        });
      }
    } finally {
      setIsLoadingCode(false);
    }
  }, [fetchUrl]);

  useEffect(() => {
    fetchCodeFile();
  }, [fetchCodeFile]);

  if (isLoadingCode) {
    return (
      <div className="space-y-3 p-3">
        <SkeletonLoader size="xl" />
        <SkeletonLoader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col gap-2.5 items-center">
          <div className="flex gap-2 items-center">
            <Alert size="lg" className="!fill-red-70 dark:!fill-red-50" />
            <Typography
              variant="body1"
              className="!text-red-70 dark:!text-red-50"
            >
              Error when loading file
            </Typography>
          </div>
          <Button
            onClick={() => {
              fetchCodeFile();
            }}
          >
            Reload File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      {!isLoadingCode && !error && code && (
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? oneDark : oneLight}
          showLineNumbers
          customStyle={{
            height: '100%',
            backgroundColor: 'inherit',
            padding: 0,
            margin: 0,
            textShadow: 'none',
          }}
          codeTagProps={{
            style: {
              backgroundColor: 'inherit',
              textShadow: 'none',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
};

export default CodeFile;
