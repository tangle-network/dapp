import { useCurrentSessionAuthoritiesQuery } from './generated/graphql';

export const AuthoritiesData = () => {
  const { data } = useCurrentSessionAuthoritiesQuery();

  return <>{JSON.stringify(data)}</>;
};
