import { ArrowUpload24Regular } from '@fluentui/react-icons';

const HeroImageUploader = ({ imageUrl, onFileChange }) => {
  return (
    <div className="flex w-full max-w-4xl flex-col items-start gap-5">
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <label
        htmlFor="fileInput"
        className="group box-border flex min-h-[300px] w-full max-w-4xl cursor-pointer items-center justify-center overflow-hidden rounded-[12px] transition-all duration-300 hover:brightness-95"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Hero"
            className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-90"
            loading="lazy"
          />
        ) : (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[rgba(0,0,0,0.3)] px-6 py-10 transition-all duration-200 group-hover:bg-black/5">
            <ArrowUpload24Regular className="h-[54px] w-[54px] text-[#44294B]" />
            <div className="text-[24px] font-[500] text-[#44294B]">Upload a Hero Image</div>
            <div className="w-[536px] text-center text-[14px] text-[#666666]">
              You can upload PNG or JPEG Image. Minimum dimensions must be 500px X 500px
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default HeroImageUploader;
