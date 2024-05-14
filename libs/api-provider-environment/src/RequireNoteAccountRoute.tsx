import type { FC, PropsWithChildren } from 'react';
import { Navigate, type NavigateProps } from 'react-router';
import { useWebContext } from './webb-context/index.js';

/**
 * Redirects to the given route if the user is not created a note account.
 * Must be used inside a `WebbProvider` component.
 * @param redirect The route to redirect to.
 */
const RequireNoteAccountRoute: FC<
  PropsWithChildren<{
    redirect: NavigateProps['to'];
  }>
> = ({ redirect, children }) => {
  const { noteManager, isConnecting, loading } = useWebContext();

  if (isConnecting || loading) {
    return null;
  }

  if (!noteManager?.getKeypair()) {
    return <Navigate to={redirect} />;
  }

  return children;
};

export default RequireNoteAccountRoute;
