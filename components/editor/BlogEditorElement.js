import { Delete24Regular } from '@fluentui/react-icons';
import TextareaAutosize from 'react-textarea-autosize';
import { PRESSABLE_BTN } from './constants';

const BlogEditorElement = ({
  type,
  content,
  showImageCaptionInput,
  setShowImageCaptionInput,
  onContentChange,
  onDeleteElement,
}) => {
  return (
    <div
      className={`group relative flex w-full items-center border border-transparent ${type === 'image-caption' ? '' : 'mb-6'} focus-within:border-[#E20ABF] hover:border-[#E20ABF]`}
    >
      {type === 'divider' ? (
        <div className="relative flex w-full items-center">
          <div className="w-full border-b border-[rgba(0,0,0,0.2)]" />
          <Delete24Regular
            className="absolute h-6 w-6 cursor-pointer text-red-500 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            style={{ right: '-30px' }}
            onClick={(e) => {
              onDeleteElement();
              e.stopPropagation();
            }}
          />
        </div>
      ) : (
        <div className={`relative flex w-full items-center ${type === 'image-caption' && !showImageCaptionInput ? 'bg-gray-100' : ''}`}>
          {type === 'image-caption' ? (
            showImageCaptionInput ? (
              <input
                type="text"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className={`w-full bg-transparent text-[26px] font-geist-variable outline-none ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
                placeholder="Add an Image caption"
              />
            ) : (
              <button
                onClick={() => setShowImageCaptionInput(true)}
                className={`ml-auto flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600 ${PRESSABLE_BTN}`}
              >
                Add an Image caption
              </button>
            )
          ) : (
            <TextareaAutosize
              wrap="hard"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full resize-none overflow-hidden bg-transparent outline-none ${
                type === 'heading' ? 'font-playfair-display text-center text-[42px] font-normal leading-[55.99px]' : ''
              } ${
                type === 'sub-heading' ? 'font-geist-variable text-[32px] font-[600]' : ''
              } ${
                type === 'paragraph' ? 'font-geist-variable text-[20px] font-[400]' : ''
              } ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
              placeholder={
                type === 'heading'
                  ? 'Begin with an interesting heading here'
                  : type === 'sub-heading'
                    ? 'Add a subheading'
                    : type === 'paragraph'
                      ? 'Start your paragraph here...'
                      : ''
              }
              minRows={1}
            />
          )}

          {type !== 'heading' && (
            <Delete24Regular
              className="absolute h-6 w-6 cursor-pointer text-red-500 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              style={{ right: '-30px' }}
              onClick={(e) => {
                onDeleteElement();
                e.stopPropagation();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BlogEditorElement;
