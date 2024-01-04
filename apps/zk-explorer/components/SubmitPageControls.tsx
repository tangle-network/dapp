'use client';

import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import { validateGithubUrl } from '../utils';
import { handleSubmitProject } from '../utils/utils';

export const SubmitPageControls: FC<Record<string, never>> = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [isValidGithubUrl, setIsValidGithubUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

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
          onClick={async () => {
            const errorMessage = await handleSubmitProject(githubUrl);

            setErrorMessage(errorMessage !== null ? errorMessage : undefined);
          }}
        >
          Submit Project
        </Button>
      </div>
    </>
  );
};
