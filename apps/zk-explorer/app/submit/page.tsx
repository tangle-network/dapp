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
import { validateGithubUrl } from '../../utils/utils';

export default function Submit() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);
  const [isGithubUrlDisplayingError, setIsGithubUrlDisplayingError] =
    useState(false);

  return (
    <main className="flex flex-col gap-6 pt-6">
      <Typography variant="h4" fw="bold">
        Upload Project
      </Typography>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <Card className="max-w-[780px]">
          <Typography variant="h5">1. GitHub Repository URL:</Typography>

          <Input
            id="repository url"
            autoFocus
            placeholder="https://github.com/username/repository-name"
            errorMessage={
              isGithubUrlDisplayingError ? '*Invalid GitHub URL.' : undefined
            }
            isInvalid={isGithubUrlDisplayingError}
            value={githubUrl}
            onChange={(value) => {
              setGithubUrl(value);

              const isNewUrlValid = validateGithubUrl(value);

              setIsValidGithubUrl(isNewUrlValid);
              setIsGithubUrlDisplayingError(value.length > 0 && !isNewUrlValid);
            }}
          />

          <div className="flex gap-4 flex-col sm:flex-row">
            <Button variant="secondary" isFullWidth>
              Learn More
            </Button>
            {/* TODO: Perform mock submission once the submit button is clicked. */}
            <Button
              isDisabled={!isValidGithubUrl}
              onClick={() => alert('Submit!')}
              isFullWidth
            >
              Submit Project
            </Button>
          </div>
        </Card>

        <Card className="p-6 shadow-md space-y-4 w-auto">
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
