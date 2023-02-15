/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { FC, useMemo, useState } from 'react';
import { Heading4 } from '../components';
import { Notion, Post } from '../libs/notion';

const Blogs: FC<{ posts: Post[] }> = ({ posts }) => {
  const tagsArrays = posts.map((object) => object.metadata['tags']);

  const [filter, setFilter] = useState('');

  const tags = useMemo(() => {
    return tagsArrays.reduce((accumulator, current) => {
      current.forEach((tag) => {
        if (!accumulator.includes(tag)) {
          accumulator.push(tag);
        }
      });
      return accumulator;
    }, []);
  }, [tagsArrays]);

  const filteredPosts = useMemo(() => {
    if (filter) {
      return posts.filter((post) => post.metadata.tags.includes(filter));
    }
    return posts;
  }, [filter, posts]);

  return (
    <div className="pt-[80px]">
      <div className="my-4 mb-10 text-center cursor-pointer">
        {tags.map((tag) => (
          <span
            key={tag}
            onClick={() => {
              setFilter(tag);
            }}
            className="bg-gray-600 text-white px-2 py-1 rounded-full mr-2"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className=" flex flex-wrap gap-y-6 gap-x-4 m-auto w-[1200px]">
        {filteredPosts.map((post) => {
          const { id, title, slug, tags, cover } = post.metadata;

          return (
            <Link key={id} href={`/blog/${slug}`}>
              <div className="rounded-md w-[384px] shadow-xl">
                <img src={cover} alt="" width="384px" height="384px" />
                <div className="flex flex-col space-y-3 pt-6 pb-4 px-2">
                  <span className="space-x-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-pink-100 px-2 py-1 rounded-full text-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                  <Heading4>{title}</Heading4>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const getStaticProps = async () => {
  const notion = new Notion();

  const posts = await notion.getPosts();

  return {
    props: {
      posts,
    },
    revalidate: 60,
  };
};

export default Blogs;
