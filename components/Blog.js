import { ChevronDown16Regular } from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ClipLoader } from 'react-spinners';

const formatPublishedMeta = (timestamp) => {
  const now = new Date();
  const publishedDate = timestamp?.toDate ? new Date(timestamp.toDate()) : now;
  const daysAgo = Math.max(0, Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24)));

  if (daysAgo === 0) return 'Published today';
  if (daysAgo === 1) return 'Published 1 day ago';
  return `Published ${daysAgo} days ago`;
};

const Blog = ({ blog }) => {
  const router = useRouter();
  const [openingEditor, setOpeningEditor] = useState(false);

  const handleManageClick = (id) => {
    if (openingEditor) return;
    setOpeningEditor(true);
    router.push(`/editBlog?id=${id}`);
  };

  const readingTime = useMemo(() => {
    const totalContentLength = (blog.elements || []).reduce((total, element) => {
      if (['heading', 'sub-heading', 'paragraph'].includes(element.type)) {
        return total + (element.content ? element.content.length : 0);
      }
      return total;
    }, 0);

    return Math.max(1, Math.ceil(totalContentLength / 250));
  }, [blog.elements]);

  return (
    <article className="surface-card flex w-full flex-col gap-5 overflow-hidden p-4 sm:p-5 lg:flex-row lg:items-start lg:gap-6 lg:p-6">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 lg:w-64 lg:flex-none">
        <img
          src={blog.imageUrl}
          alt={blog.heading}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="space-y-3">
          <h2 className="font-geist-variable line-clamp-2 text-2xl font-medium text-[#222222] sm:text-[1.7rem]">
            {blog.heading}
          </h2>
          <p className="text-sm text-[#444444]">
            {`${formatPublishedMeta(blog.timestamp)} • ${readingTime} min read`}
          </p>
          <p className="line-clamp-3 text-base leading-7 text-[#666666] sm:text-[1.05rem]">
            {blog.imageCaption}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleManageClick(blog.id)}
            disabled={openingEditor}
            className="pressable-btn inline-flex min-w-[8rem] items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm text-[#333333]"
          >
            {openingEditor ? <ClipLoader size={16} color="#333333" /> : <span>Open Blog</span>}
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-5 py-3 text-sm text-[#999999]"
          >
            <span>Manage</span>
            <ChevronDown16Regular primaryFill="#333333" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default Blog;