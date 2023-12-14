'use client';

import { Breadcrumbs, BreadcrumbsItem, Button, Input, Card, TitleWithInfo, Footer, WalletButton, Typography, IconButton, Dropdown, DropdownBasicButton, DropdownMenu, DropdownBody, DropdownButton, MenuItem } from '@webb-tools/webb-ui-components';
import { ArrowRightUp, MetaMaskIcon, Search, ThreeDotsVerticalIcon, CheckboxBlankCircleLine, ExternalLinkLine } from '@webb-tools/icons';
import { WalletConfig } from '@webb-tools/dapp-config';
import { useState } from 'react';

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
    <main className="space-y-6 flex flex-col">
      <div className="flex flex-col gap-6">
        <Typography variant="h4" fw="bold">
          Upload Project
        </Typography>

        <div className="flex gap-6 mb-auto">
          <Card className="">
            <Typography variant="h5" className="text-mono-0">
              1. GitHub Repository URL:
            </Typography>

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

            <div className="flex space-x-4">
              <Button variant="secondary" isFullWidth>Learn More</Button>
              {/* TODO: Perform mock submission once the submit button is clicked. */}
              <Button
                isDisabled={!isValidGithubUrl}
                onClick={() => alert("Submit!")}
                isFullWidth
              >Submit Project</Button>
            </div>
          </Card>

          <div>
            <Card className="p-6">
              <div>
                <TitleWithInfo title="Feedback" variant="h5" />
                <Typography variant="h5" className="text-mono-100">
                  Have feedback? Reach out to share your thoughts & suggestions!
                </Typography>
              </div>

              <IconButton>
                <ArrowRightUp />
              </IconButton>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
