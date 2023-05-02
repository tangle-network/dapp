import { InformationLine } from '@webb-tools/icons';
import { Typography, Button, Input } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';

export const WebsiteNewsletterForm: FC<{
  onSuccess: (isSuccess: boolean) => void;
}> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formEl = event.currentTarget;

      console.dir(formEl);

      const emailInput = formEl.elements.namedItem('email');

      if (!emailInput) {
        console.warn("Can't find email input");
        return;
      }
      const email = (emailInput as HTMLInputElement).value;

      if (!email) {
        setError('Please fill in all fields');
        return;
      }

      // Form the request for sending data to the server.
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      };

      const endpoint = '/api/subscribers';

      try {
        setLoading(true);
        const response = await fetch(endpoint, options);
        console.log('response', response);

        if (response.status === 200) {
          // Success then reset the form
          setEmail('');
          setError(null);
          onSuccess(true);
        } else {
          // Error
          const { message } = await response.json();
          setError(message);
        }
      } catch (error) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return (
    <div>
      <form
        className="flex flex-col space-y-4 sm:items-center sm:space-y-0 sm:flex-row sm:space-x-2"
        name="newsletter"
        id="newsletter"
        onSubmit={handleSubmit}
      >
        <Input
          className="w-full md:w-1/2"
          id="email"
          isRequired
          name="email"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(val) => setEmail(val)}
        />
        <div>
          <Button
            isLoading={loading}
            type="submit"
            className="button-base button-primary"
            isFullWidth
          >
            Subscribe
          </Button>
        </div>
      </form>
      {error && (
        <span className="flex mt-4 dark:text-red-50">
          <InformationLine className="!fill-current mr-1" />
          <Typography variant="body3" fw="bold" className="!text-current">
            {error}
          </Typography>
        </span>
      )}
    </div>
  );
};
