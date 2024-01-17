'use client';

import {
  Button,
  Card,
  Input,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo, useState } from 'react';
import { updateUserProfile } from '../api/user';
import { User, useAuth, useRequireAuth } from '../hooks/useAuth';
import { computeUserDiff } from '../utils';
import LargeSquareAvatar from './LargeSquareAvatar';

const DashboardSettingsTab: FC = () => {
  const user = useRequireAuth();
  const { refreshAuth } = useAuth();

  const initialUser: User = useMemo(
    // Use empty strings as fallbacks for the optional fields.
    // This is needed in order to detect whether the user has made
    // any changes.
    () => ({
      twitterHandle: '',
      website: '',
      shortBio: '',
      ...user,
    }),
    [user]
  );

  const [email, setEmail] = useState(initialUser.email);

  const [githubUsername, setGithubUsername] = useState(
    initialUser.githubUsername
  );

  const [twitterHandle, setTwitter] = useState(initialUser.twitterHandle || '');
  const [shortBio, setShortBio] = useState(initialUser.shortBio || '');
  const [website, setWebsite] = useState(initialUser.website || '');

  const wereChangesMade = useMemo(
    () =>
      email !== initialUser.email ||
      githubUsername !== initialUser.githubUsername ||
      twitterHandle !== initialUser.twitterHandle ||
      website !== initialUser.website ||
      shortBio !== initialUser.shortBio,
    [email, githubUsername, twitterHandle, website, shortBio, initialUser]
  );

  const restoreChanges = useCallback(() => {
    setEmail(initialUser.email);
    setGithubUsername(initialUser.githubUsername);
    setTwitter(initialUser.twitterHandle || '');
    setWebsite(initialUser.website || '');
    setShortBio(initialUser.shortBio || '');
  }, [
    initialUser.email,
    initialUser.githubUsername,
    initialUser.shortBio,
    initialUser.twitterHandle,
    initialUser.website,
  ]);

  const saveChanges = useCallback(async () => {
    // TODO: Need to ensure that the inputs' values are valid before performing the request. For example, the email input might contain an invalid email address.

    const diff = computeUserDiff(initialUser, {
      email,
      githubUsername,
      twitterHandle,
      website,
      shortBio,

      // Certain properties are not directly editable by
      // the user, but instead are managed by the backend.
      id: initialUser.id,
      createdAt: initialUser.createdAt,
      activatedCircuitCount: initialUser.activatedCircuitCount,
    });

    // TODO: Handle potential API request failure.
    await updateUserProfile(diff);

    // After updating the user profile, refresh the auth's
    // user object to reflect the changes.
    await refreshAuth();
  }, [
    email,
    githubUsername,
    initialUser,
    refreshAuth,
    shortBio,
    twitterHandle,
    website,
  ]);

  return (
    <Card className="flex flex-col-reverse sm:flex-row justify-between p-6 rounded-2xl space-y-0 gap-7">
      <div className="flex flex-col gap-4 md:gap-12 w-full max-w-[892px]">
        <Typography variant="h5" fw="bold">
          Profile Settings
        </Typography>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex flex-col gap-3 w-full">
            <Typography
              variant="body1"
              fw="semibold"
              className="dark:text-mono-0"
            >
              GitHub:
            </Typography>

            <Input
              id="user github url"
              isDisabled
              value={githubUsername}
              onChange={setGithubUsername}
              className="w-full"
              placeholder="www.github.com/webb"
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Typography
              variant="body1"
              fw="semibold"
              className="dark:text-mono-0"
            >
              Email Address:
            </Typography>

            <Input
              id="user email address"
              className="w-full"
              placeholder="hello@webb.tools"
              type="email"
              value={email}
              onChange={setEmail}
            />
          </div>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex flex-col gap-3 w-full">
            <Typography
              variant="body1"
              fw="semibold"
              className="dark:text-mono-0"
            >
              Twitter:
            </Typography>

            <Input
              id="user twitter url"
              className="w-full"
              value={twitterHandle}
              onChange={setTwitter}
              placeholder="@webbprotocol"
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Typography
              variant="body1"
              fw="semibold"
              className="dark:text-mono-0"
            >
              Website:
            </Typography>

            <Input
              id="user website url"
              className="w-full"
              placeholder="https://www.webb.tools/"
              value={website}
              onChange={setWebsite}
              type="url"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Typography
            variant="body1"
            fw="semibold"
            className="dark:text-mono-0"
          >
            Short Bio:
          </Typography>

          <Input
            id="user short bio"
            className="w-full"
            placeholder="Share a bit about yourself..."
            value={shortBio}
            onChange={setShortBio}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            onClick={restoreChanges}
            isDisabled={!wereChangesMade}
            variant="secondary"
          >
            Cancel
          </Button>

          <Button isDisabled={!wereChangesMade} onClick={saveChanges}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 items-end">
        <LargeSquareAvatar />

        {/* TODO: Handle upload avatar button. */}
        <Button variant="secondary">Upload</Button>
      </div>
    </Card>
  );
};

export default DashboardSettingsTab;
