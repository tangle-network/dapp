import { CircuitItem } from '../components/CircuitCard';
import { FilterConstraints } from '../components/Filters/types';
import { ApiRoute, extractResponseData, sendApiRequest } from '../utils/api';

export enum SearchSortByClause {
  MostPopular = 'Most Popular',
  Newest = 'Newest',
}

export type CircuitSearchResponseData = {
  circuits: CircuitItem[];
  resultCount: number;
};

export async function searchCircuits(
  constraints: FilterConstraints,
  query: string,
  page: number,
  sortBy?: SearchSortByClause
): Promise<CircuitSearchResponseData> {
  const responseWrapper = await sendApiRequest<CircuitSearchResponseData>(
    ApiRoute.SearchCircuits,
    'Failed to fetch circuits',
    {
      method: 'GET',
      body: JSON.stringify({
        constraints,
        query,
        page,
        sortBy: sortBy ?? null,
      }),
    }
  );

  return extractResponseData(responseWrapper);
}
