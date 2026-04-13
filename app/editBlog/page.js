"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditBlogUtil from "../../components/EditBlog";
import { ClipLoader } from "react-spinners";

const PageSpinner = () => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white py-16">
    <ClipLoader size={40} color="#86005E" />
    <p className="text-[15px] text-[#666666]">Opening editor…</p>
  </div>
);

const EditBlogContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <PageSpinner />;

  return <EditBlogUtil id={id} />;
};

const EditBlogPage = () => {
  return (
    <Suspense fallback={<PageSpinner />}>
      <EditBlogContent />
    </Suspense>
  );
};

export default EditBlogPage;