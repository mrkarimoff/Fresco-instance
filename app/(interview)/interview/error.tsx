'use client'; // Error components must be Client components

import { useEffect } from 'react';
import { Button } from '~/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2 className="">Interview error boundary: Something went wrong!</h2>
      <pre>
        <code>{error.message}</code>
      </pre>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}