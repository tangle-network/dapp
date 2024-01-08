import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css/github-markdown.css';

import { getProjectSummaryData } from '../../../server';

export default async function Summary() {
  const readMeRawMd = await getProjectSummaryData();

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
