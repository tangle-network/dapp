import React from 'react';
import {
  TwitterFill,
  CopyLinkFill,
  Common2Icon,
  TelegramFill,
  GithubFill,
  DiscordFill,
  LinkedIn,
} from '@webb-tools/icons';
import copyToClipboard from 'copy-to-clipboard';
import { IconBase } from '@webb-tools/icons/types';
import { Button, Typography, useWebbUI } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { Notion, Post, StaticPropsParams } from '../../../libs/notion';

type SharableLinkType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href?: string;
  onClick?: () => void;
};

const Post: FC<{ post: Post }> = ({
  post: {
    metadata: {
      title,
      cover,
      description,
      authors,
      tags,
      slug,
      dateAndTime: { lastEditedDate },
    },
    recordMap,
  },
}) => {
  const { notificationApi } = useWebbUI();

  const shareLink = `https://webb.tools/blog/posts/${slug}`;

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
      Icon: LinkedIn,
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
        style={{ backgroundImage: `url(${cover})`, backgroundSize: 'cover' }}
        className="h-[400px] z-0"
      ></div>
      <div className="w-[358px] sm:w-[600px] md:w-[700px] lg:w-[900px] mx-auto z-10 mt-[-120px]">
        <div className="w-full mb-9 p-6 bg-mono-0 rounded-lg shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between">
            <div className="items-center hidden gap-4 capitalize lg:flex">
              {tags &&
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="single-post-card-tag text-mono-120"
                  >
                    {tag}
                  </span>
                ))}
            </div>
            <span className="hidden text-mono-120 lg:inline-block single-post-card-date">
              {lastEditedDate}
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
              {authors.map((author) => (
                <Button
                  key={author.name}
                  variant="link"
                  href={
                    author.twitter
                      ? `https://twitter.com/${author.twitter}`
                      : ''
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
              ))}
            </div>
            <span className="card-tag text-mono-120 lg:hidden single-post-card-date">
              {lastEditedDate}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between lg:flex-row-reverse lg:items-center">
          <div className="flex items-center self-end justify-end gap-6 lg:flex-col lg:self-start">
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
          <div>
            <NotionRenderer
              bodyClassName="py-0 my-0 pb-[72px] px-0 lg:pl-6"
              disableHeader
              components={{
                Header: () => <Typography variant="mkt-h2" />,
                nextImage: Image,
                nextLink: Link,
                Collection: () => null,
              }}
              recordMap={recordMap}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();

  return {
    paths: posts.map((post) => `/blog/posts/${post.metadata.slug}`),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as StaticPropsParams;

  if (!slug) throw new Error('Slug is not defined.');

  const notion = new Notion();

  const post = await notion.getPostBySlug(slug);

  return {
    props: {
      post: post,
    },
    revalidate: 60,
  };
};

export default Post;
