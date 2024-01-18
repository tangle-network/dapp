import { ProjectItem } from '../components/ProjectCard';
import { FilterConstraints } from '../containers/Filters/types';
import {
  ApiResponse,
  ApiRoute,
  extractResponseData,
  sendApiRequest,
} from '../utils/api';
import { SearchSortByClause } from './circuits';

export type ProjectSearchResponseData = {
  projects: ProjectItem[];
  resultCount: number;
};

export async function submitProject(githubSlug: string): Promise<ApiResponse> {
  const responseWrapper = await sendApiRequest(
    ApiRoute.Projects,
    'Failed to submit project',
    {
      method: 'POST',
      body: JSON.stringify({ githubSlug }),
    }
  );

  return responseWrapper.innerResponse;
}

export async function searchProjects(
  constraints: FilterConstraints,
  query: string,
  page: number,
  sortBy?: SearchSortByClause
): Promise<ProjectSearchResponseData> {
  const responseWrapper = await sendApiRequest<ProjectSearchResponseData>(
    ApiRoute.SearchProjects,
    'Failed to fetch projects',
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
