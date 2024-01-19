import 'github-markdown-css/github-markdown.css';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { fetchProjectDetailsSummary } from '../../server/projectDetails';

export default async function Summary() {
  const readMeRawMd = await fetchProjectDetailsSummary();

  return (
    <div className="markdown-body p-6">
      {/* TODO: Consider using GitHub API when integrating instead of react-markdown to get the best result */}
      {/* https://docs.github.com/en/rest/markdown/markdown#render-a-markdown-document */}
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {readMeRawMd}
      </Markdown>
    </div>
  );
}
