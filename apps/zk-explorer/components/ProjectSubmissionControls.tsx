'use client';

import { FC, useState } from 'react';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { validateGithubUrl } from '../utils';

export const ProjectSubmissionControls: FC<Record<string, never>> = () => {
  const [isGithubUrlDisplayingError, setIsGithubUrlDisplayingError] =
    useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);

  return (
    <>
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
    </>
  );
};
