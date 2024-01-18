'use client';

import { Button, Input } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import {
  createProjectDetailPath,
  parseGithubUrl,
  submitProject,
  validateGithubUrl,
} from '../utils';

export const SubmitPageControls: FC<Record<string, never>> = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();

  const handleSubmit = useCallback(async () => {
    const response = await submitProject(githubUrl);

    if (response.isSuccess) {
      const githubUrlParseResult = parseGithubUrl(githubUrl);

      assert(
        githubUrlParseResult !== null,
        'Github URL should be valid after a successful submission.'
      );

      const [owner, repo] = githubUrlParseResult;

      // Navigate to the newly created project's page.
      router.push(createProjectDetailPath(owner, repo));

      return;
    }

    assert(
      response.errorMessage !== undefined,
      'Error message should be provided when the response did not indicate success.'
    );

    const errorMessage = response.errorMessage;

    setErrorMessage(errorMessage !== null ? errorMessage : undefined);
  }, [githubUrl, router]);

  return (
    <>
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
        {/* TODO: Need link for this. */}
        <Button href="#" variant="secondary" isFullWidth>
          Learn More
        </Button>

        <Button
          isFullWidth
          isDisabled={!isValidGithubUrl}
          onClick={handleSubmit}
        >
          Submit Project
        </Button>
      </div>
    </>
  );
};
