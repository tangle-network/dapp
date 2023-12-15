'use client';

import { Button, Input, Card, Typography, IconButton } from '@webb-tools/webb-ui-components';
import { ArrowRightUp } from '@webb-tools/icons';
import { useState } from 'react';
import { IconSize } from "../../../dist/libs/icons/types";
import { Link } from '@webb-tools/webb-ui-components/components/Link';

export default function Index() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);
  const [isGithubUrlDisplayingError, setIsGithubUrlDisplayingError] = useState(false);

  const validateGithubUrl = (url: string): boolean => {
    const trimmedUrl = url.trim();
    const GITHUB_URL_PREFIX = 'https://github.com/'; // TODO: Consider whether HTTP URLs should be allowed.

    if (!trimmedUrl.startsWith(GITHUB_URL_PREFIX)) {
      return false;
    }

    const significantPathSegment = trimmedUrl.slice(GITHUB_URL_PREFIX.length);
    const parts = significantPathSegment.split('/');

    // The significant path segment should be in the form of
    // <username>/<repository-name>, so there should be exactly
    // two parts.
    if (parts.length !== 2) {
      return false;
    }

    const segmentRegex = /^([a-zA-Z0-9_-]+)$/i;
    const owner = parts[0];
    const repo = parts[1];

    return segmentRegex.test(owner) && segmentRegex.test(repo);
  };

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
            errorMessage={isGithubUrlDisplayingError ? '*Invalid GitHub URL.' : undefined}
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
            <Button variant="secondary" isFullWidth>Learn More</Button>
            {/* TODO: Perform mock submission once the submit button is clicked. */}
            <Button
              isDisabled={!isValidGithubUrl}
              onClick={() => alert("Submit!")}
              isFullWidth
            >Submit Project</Button>
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
