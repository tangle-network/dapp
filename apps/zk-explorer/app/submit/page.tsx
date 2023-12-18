'use client';

import {
  Button,
  Input,
  Card,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ArrowRightUp } from '@webb-tools/icons';
import { useState } from 'react';
import { Link } from '@webb-tools/webb-ui-components/components/Link';
import { handleSubmitProject, validateGithubUrl } from '../../utils/utils';

export default function Submit() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  return (
    <main className="flex flex-col gap-6 pt-6">
      <Typography variant="h4" fw="bold">
        Upload Project
      </Typography>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Card className="max-w-[780px]">
          <Typography variant="h5">1. GitHub Repository URL:</Typography>

          <Input
            autoFocus
            id="repository url"
            placeholder="https://github.com/username/repository-name"
            errorMessage={errorMessage ? `*${errorMessage}` : undefined}
            isInvalid={errorMessage !== undefined}
            value={githubUrl}
            onChange={(value) => {
              setGithubUrl(value);

              const isNewUrlValid = validateGithubUrl(value);

              setIsValidGithubUrl(isNewUrlValid);

              setErrorMessage(
                value.length > 0 && !isNewUrlValid
                  ? 'Invalid GitHub URL.'
                  : undefined
              );
            }}
          />

          <div className="flex gap-4 flex-col sm:flex-row">
            <Button variant="secondary" isFullWidth>
              Learn More
            </Button>
            <Button
              isFullWidth
              isDisabled={!isValidGithubUrl}
              onClick={async () => {
                const errorMessage = await handleSubmitProject(githubUrl);

                setErrorMessage(
                  errorMessage !== null ? errorMessage : undefined
                );
              }}
            >
              Submit Project
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-md space-y-4 w-auto items-start">
          <div>
            <Typography variant="h5">Feedback</Typography>

            <Typography variant="h5" className="dark:text-mono-100" fw="normal">
              Have feedback? Reach out to share your thoughts & suggestions!
            </Typography>
          </div>

          {/* TODO: Replace this with a link to the feedback form. */}
          <Link href="#">
            <ArrowRightUp size="lg" />
          </Link>
        </Card>
      </div>
    </main>
  );
}
