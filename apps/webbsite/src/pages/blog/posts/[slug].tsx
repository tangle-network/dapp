/* eslint-disable @next/next/no-img-element */
import { TwitterFill, CopyLinkFill } from '@webb-tools/icons';
import copyToClipboard from 'copy-to-clipboard';
import { IconBase } from '@webb-tools/icons/types';
import { Button, useWebbUI } from '@webb-tools/webb-ui-components';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { NotionRenderer } from 'react-notion-x';
import { Heading2, Heading3, SubHeading1 } from '../../../components';
import { Notion, Post, StaticPropsParams } from '../../../libs/notion';

type SharableLinkType = {
  Icon: (props: IconBase) => JSX.Element;
  name: string;
  href?: string;
  onClick?: () => void;
};

const Post: FC<{ post: Post }> = ({ post }) => {
  const {
    title,
    cover,
    description,
    author,
    tags,
    slug,
    dateAndTime: { lastEditedDate },
  } = post.metadata;

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
            <div className="hidden items-center gap-4 capitalize lg:flex">
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
            <span className="text-mono-120 hidden lg:inline-block single-post-card-date">
              {lastEditedDate}
            </span>
          </div>
          <Heading3 className="mt-4 single-post-card-title text-mono-200">
            {title}
          </Heading3>
          <SubHeading1 className="mt-4 single-post-card-description text-mono-170">
            {description}
          </SubHeading1>
          <div className="flex items-center justify-between">
            <Button
              variant="link"
              href={``}
              target="_blank"
              className="mt-7 single-post-card-author"
            >
              {author}
            </Button>
            <span className="card-tag text-mono-120 lg:hidden single-post-card-date">
              {lastEditedDate}
            </span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row-reverse justify-between lg:items-center">
          <div className="self-end flex lg:flex-col items-center justify-end lg:self-start gap-2">
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
                  key={name}
                  className="w-8 h-8 !fill-current cursor-pointer"
                />
              </a>
            ))}
          </div>
          <div>
            <NotionRenderer
              bodyClassName="py-0 my-0 pb-[72px] px-0 lg:pl-6"
              disableHeader
              components={{
                Header: Heading2,
                nextImage: Image,
                nextLink: Link,
              }}
              recordMap={post.recordMap}
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

  if (!posts) return { paths: [], fallback: true };

  return {
    paths: posts.map((post: any) => `/blog/posts/${post.metadata.slug}`),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as StaticPropsParams;

  if (!slug) throw new Error('Slug is not defined.');

  const notion = new Notion();

  const post = await notion.getPostBySlug(slug);

  if (!post) return { props: { post: {} }, fallback: true };

  return {
    props: {
      post: post ?? {},
    },
    revalidate: 60,
  };
};

export default Post;
