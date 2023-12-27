import {
  ProjectDetailTabsContainer,
  ProjectGitHubInfoContainer,
  ProjectHeaderContainer,
  RelatedProjectsContainer,
} from '../../../containers';
import { Header } from '../../../components/Header';

export default function ProjectPage({ params }: { params: { slug: string } }) {
  // const projectId = params.slug;

  // TODO: Handle invalid project id, return 404

  return (
    <main className="space-y-6">
      {/* Header */}
      {/* TODO: update breadcrumb */}
      <Header />

      <div className="grid grid-cols-4 grid-rows-[auto_1fr] gap-6">
        <ProjectGitHubInfoContainer className="row-span-2" />

        <ProjectHeaderContainer className="col-span-3" />

        <ProjectDetailTabsContainer className="col-span-3" />
      </div>

      <RelatedProjectsContainer />
    </main>
  );
}
