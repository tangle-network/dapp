import { Button, Typography } from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BlogCard } from '../../components';
import { PostsOrVideos } from '../../libs/webb-cms';

type BlogSectionProps = {
  type: 'post' | 'video';
  items: PostsOrVideos[];
  showAllItems?: boolean;
};

export const BlogSection = ({
  type,
  items,
  showAllItems = false,
}: BlogSectionProps) => {
  const allItems = showAllItems ? items : items.slice(0, 6);

  const [filter, setFilter] = useState('All');

  const tags = useMemo(() => {
    const tags = allItems.reduce(
      (accumulator, { tag }) => {
        if (!accumulator.includes(tag)) {
          accumulator.push(tag);
        }
        return accumulator;
      },
      ['All']
    );
    return tags;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return filter === 'All'
      ? allItems
      : allItems.filter((item) => item.tag === filter);
  }, [filter, allItems]);

  return (
    <div className="px-4 mt-[18px]">
      <Typography
        variant="mkt-h3"
        className="mb-8 blog-section-title text-mono-200"
      >
        {type === 'post' ? 'Writings' : 'Media & Press'}
      </Typography>

      <div className="flex flex-wrap mb-8">
        {tags.map((tag) => (
          <span
            key={tag}
            onClick={() => {
              setFilter(tag);
            }}
            className={tag === filter ? 'tag-selected' : 'tag'}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-[72px]">
        {filteredItems.map(
          ({
            id,
            title,
            coverImage,
            tag,
            postType,
            linkToResearchPaper,
            linkToVideo,
          }) => {
            return (
              <BlogCard
                key={id}
                title={title}
                tag={tag}
                cover={coverImage}
                postType={postType}
                type={type}
                link={
                  type === 'post' &&
                  postType === 'Research' &&
                  linkToResearchPaper
                    ? linkToResearchPaper
                    : type === 'post' &&
                      postType === 'Research' &&
                      !linkToResearchPaper
                    ? `/blog/posts/${id}`
                    : type === 'video' && !postType && linkToVideo
                    ? linkToVideo
                    : type === 'post' && postType === 'Post'
                    ? `/blog/posts/${id}`
                    : ''
                }
              />
            );
          }
        )}
      </div>

      {!showAllItems && (
        <Link href={type === 'post' ? '/blog/posts' : '/blog/videos'}>
          <Button className="block button-base button-primary mx-auto mb-[54px]">
            See All {type === 'post' ? 'Writing' : 'Videos'}
          </Button>
        </Link>
      )}
    </div>
  );
};
