import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'github-markdown-css/github-markdown-dark.css';

import { getProjectCircuitsData } from '../../server';

export default async function Summary() {
  const readMeRawMd = await getProjectCircuitsData();

  return (
    <div className="markdown-body p-6 bg-mono-200">
      {/* TODO: Consider using GitHub API when integrating instead of react-markdown to get the best result */}
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {readMeRawMd}
      </Markdown>
    </div>
  );
}
