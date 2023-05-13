import React from 'react';
import {
  TwitterFill,
  CopyLinkFill,
  Common2Icon,
  TelegramFill,
  GithubFill,
  DiscordFill,
  LinkedInFill,
} from '@webb-tools/icons';
import copyToClipboard from 'copy-to-clipboard';
import { IconBase } from '@webb-tools/icons/types';
import { Button, Typography, useWebbUI } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import { FC } from 'react';
import { getPosts, getPostById, Post } from '../../../libs/webb-cms';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-light.css';

type SharableLinkType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href?: string;
  onClick?: () => void;
};

const Post: FC<{ post: Post }> = ({
  post: {
    title,
    coverImage,
    description,
    author,
    tag,
    id,
    markdown,
    dateAndTime: { lastUpdatedDate },
  },
}) => {
  const { notificationApi } = useWebbUI();

  const shareLink = `https://webb.tools/blog/posts/${id}`;

  const shareMessage = encodeURIComponent(
    'Checkout this post by @webbprotocol at '
  );

  const links: Array<SharableLinkType> = [
    {
      name: 'Twitter',
      Icon: TwitterFill,
      href: `https://twitter.com/share/?&url=${shareLink}&text=${shareMessage}`,
    },
    {
      name: 'Telegram',
      Icon: TelegramFill,
      href: 'https://t.me/webbprotocol',
    },
    {
      Icon: Common2Icon,
      name: 'Commonwealth',
      href: 'https://commonwealth.im/webb',
    },
    {
      name: 'Discord',
      Icon: DiscordFill,
      href: 'https://discord.com/invite/cv8EfJu3Tn',
    },
    {
      name: 'Github',
      Icon: GithubFill,
      href: 'https://github.com/webb-tools',
    },
    {
      name: 'LinkedIn',
      Icon: LinkedInFill,
      href: 'https://www.linkedin.com/company/webb-protocol/',
    },
    {
      name: 'Copy Link',
      Icon: CopyLinkFill,
      onClick: () => {
        copyToClipboard(shareLink);
        notificationApi({
          variant: 'success',
          message: 'Link copied to clipboard!',
        });
      },
    },
  ];

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${coverImage})`,
          backgroundSize: 'cover',
        }}
        className="h-[400px] z-0"
      ></div>
      <div className="w-[358px] sm:w-[600px] md:w-[700px] lg:w-[900px] mx-auto z-10 mt-[-120px]">
        <div className="w-full mb-9 p-6 bg-mono-0 rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between">
            <div className="items-center hidden gap-4 capitalize lg:flex">
              {tag && (
                <span key={tag} className="single-post-card-tag text-mono-120">
                  {tag}
                </span>
              )}
            </div>
            <span className="hidden text-mono-120 lg:inline-block single-post-card-date">
              {lastUpdatedDate}
            </span>
          </div>
          <Typography
            variant="mkt-h3"
            className="mt-4 single-post-card-title text-mono-200"
          >
            {title}
          </Typography>
          <Typography
            variant="mkt-body"
            className="mt-4 single-post-card-description text-mono-170"
          >
            {description}
          </Typography>
          <div className="flex items-center justify-between mt-7">
            <div className="flex items-baseline gap-4">
              <Button
                key={author.name}
                variant="link"
                href={
                  author.twitter ? `https://twitter.com/${author.twitter}` : ''
                }
                target="_blank"
                className={
                  author.twitter
                    ? 'single-post-card-author'
                    : 'single-post-card-author hover:border-transparent pointer-events-none'
                }
              >
                {author.name}
              </Button>
            </div>
            <span className="card-tag text-mono-120 lg:hidden single-post-card-date">
              {lastUpdatedDate}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between lg:flex-row-reverse lg:items-center">
          <div className="flex items-center self-end justify-end pb-8 gap-6 lg:flex-col lg:self-start">
            {links.map(({ Icon, name, href, onClick }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={onClick}
                className="dark:text-mono-0 dark:hover:text-mono-100"
              >
                <Icon
                  size="md"
                  key={name}
                  className="w-8 h-8 !fill-current cursor-pointer text-mono-120 hover:text-mono-200"
                />
              </a>
            ))}
          </div>
          <div className="pb-8 pr-8 markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths = async () => {
  const posts = await getPosts();

  return {
    paths: posts.map((post) => `/blog/posts/${post.id}`),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug: id } = context.params as { slug: string };

  if (!id) throw new Error('Post ID is not provided');

  const post = await getPostById(Number(id));

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};

export default Post;
