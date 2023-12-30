import {
  ProjectDetailTabsContainer,
  ProjectGitHubInfoContainer,
  ProjectHeaderContainer,
  RelatedProjectsContainer,
} from '../../../../containers';
import { Header } from '../../../../components/Header';

export default function ProjectPage({
  params,
}: {
  params: { slug: { owner: string; name: string } };
}) {
  // TODO: Handle invalid project's owner and name

  return (
    <main className="space-y-6">
      {/* Header */}
      {/* TODO: update breadcrumb */}
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-[minmax(min-content,max-content)] lg:grid-rows-[auto_1fr] gap-6">
        <ProjectGitHubInfoContainer className="row-span-1 lg:row-span-2 order-3 lg:order-1" />

        <ProjectHeaderContainer className="col-span-1 lg:col-span-3 order-1 lg:order-2" />

        <ProjectDetailTabsContainer className="col-span-1 lg:col-span-3 order-2 lg:order-3" />
      </div>

      <RelatedProjectsContainer />
    </main>
  );
}
