import { useMemo, useState } from 'react';
import { PostsOrVideos } from '../../libs/notion';
import { BlogCard, Heading3 } from '../../components';
import { Button } from '@webb-tools/webb-ui-components';
import Link from 'next/link';

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
      (accumulator, { metadata: { tags } }) => {
        tags.forEach((tag) => {
          if (!accumulator.includes(tag)) {
            accumulator.push(tag);
          }
        });
        return accumulator;
      },
      ['All']
    );
    return tags;
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return filter === 'All'
      ? allItems
      : allItems.filter((item) => item.metadata.tags.includes(filter));
  }, [filter, allItems]);

  return (
    <div className="px-4 mt-[18px]">
      <Heading3 className="mb-8 blog-section-title text-mono-200">
        {type === 'post' ? 'Writings' : 'Media & Press'}
      </Heading3>

      <div className="mb-8 flex flex-wrap">
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
            metadata: { id, title, slug, tags, cover, link, type: blogType },
          }) => (
            <BlogCard
              key={id}
              title={title}
              tags={tags}
              cover={cover}
              blogType={blogType}
              type={type}
              link={
                (type === 'post' && blogType === 'research' && link) ||
                (type === 'video' && !blogType && link)
                  ? link
                  : type === 'post' && blogType === 'post'
                  ? `/blog/posts/${slug}`
                  : ''
              }
            />
          )
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
