import { ChevronDown16Regular } from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const Blog = ({ blog }) => {
  const router = useRouter();
  const [openingEditor, setOpeningEditor] = useState(false);

  const handleManageClick = (id) => {
    if (openingEditor) return;
    setOpeningEditor(true);
    router.push(`/editBlog?id=${id}`);
  };

  const totalContentLength = (blog.elements || []).reduce((total, element) => {
    if (element.type === 'heading' || element.type === 'sub-heading') {
      return total + (element.content ? element.content.length : 0);
    }
    return total;
  }, 0);

  const readingTime = Math.max(1, Math.ceil(totalContentLength / 200));

  const now = new Date();
  const publishedDate = blog.timestamp?.toDate ? new Date(blog.timestamp.toDate()) : now;
  const daysAgo = Math.max(0, Math.floor((now - publishedDate) / (1000 * 60 * 60 * 24)));

  return (
    <div className="box-border flex flex-row items-start p-6 gap-7 w-[852px] h-[249px] bg-white border border-[rgba(0,0,0,0.1)] shadow-[0px_0px_20px_rgba(0,0,0,0.05)] rounded-[12px]">
      <div className="w-[201px] h-[201px] bg-white rounded-[7.18px] overflow-hidden">
        <img
          src={blog.imageUrl}
          alt={blog.heading}
          className="w-full h-full object-cover rounded-[7.18px]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-between items-start p-0 gap-4 w-[575px] h-[201px]">
        <div className="flex flex-col items-start p-0 gap-4 w-[575px] h-[126px]">
          <h2 className="w-[575px] h-[30px] font-['Geist Variable'] font-medium text-[24px] leading-[30px] text-[#222222]">
            {blog.heading}
          </h2>
          <p className="w-[239px] h-[14px] font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#333333]">
            {`Published ${daysAgo} days ago • ${readingTime} minute read`}
          </p>
          <p className="w-[575px] h-[52px] font-['Geist Variable'] font-normal text-[17px] leading-[150%] text-[#666666]">
            {blog.imageCaption}
          </p>
        </div>
        <div className="flex flex-row justify-end items-center p-0 gap-4 w-[575px] h-[46px]">
          <button
            type="button"
            onClick={() => handleManageClick(blog.id)}
            disabled={openingEditor}
            className="box-border flex min-w-[118px] flex-row justify-center items-center p-[15px_24px] gap-1 h-[44px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[6px] hover:shadow-[0px_2px_6px_rgba(239,68,68,0.6)] active:shadow-[0_2px_6px_rgba(239,68,68,0.6)] transition-all duration-150 active:scale-90 disabled:cursor-wait disabled:active:scale-100 disabled:opacity-90"
          >
            {openingEditor ? (
              <ClipLoader size={16} color="#333333" />
            ) : (
              <span className="font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#333333]">
                Open Blog
              </span>
            )}
          </button>
          <button className="box-border flex flex-row justify-center items-center p-[15px_16px_15px_24px] gap-2 w-[117px] h-[46px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[6px]">
            <span className="w-[53px] h-[14px] font-['Geist Variable'] font-normal text-[14px] leading-[100%] text-[#999999]">
              Manage
            </span>
            <ChevronDown16Regular primaryFill="#333333" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
