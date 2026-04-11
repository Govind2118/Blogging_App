import { useRouter } from 'next/navigation';
import { ChevronLeft24Regular, ArrowUpload24Regular, Add16Regular, Delete24Regular } from '@fluentui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';

const PRESSABLE_BTN =
  'transition-all duration-150 hover:shadow-[0_2px_6px_rgba(239,68,68,0.6)] active:shadow-[0_2px_6px_rgba(239,68,68,0.6)]';

const CreateBlogElement = ({
  id,
  type,
  content,
  showImageCaptionInput,
  setShowImageCaptionInput,
  onContentChange,
  onDeleteElement,
}) => {
  return (
    <div
      className={`group relative w-full flex items-center ${type === 'image-caption' ? '' : 'mb-6'} border border-transparent focus-within:border-[#E20ABF] hover:border-[#E20ABF]`}
    >
      {type === 'divider' ? (
        <div className="flex w-full items-center relative">
          <div className="w-full border-b border-[rgba(0,0,0,0.2)]"></div>
          <Delete24Regular
            className="absolute w-6 h-6 cursor-pointer text-red-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            style={{ right: '-30px' }}
            onClick={(e) => {
              onDeleteElement();
              e.stopPropagation();
            }}
          />
        </div>
      ) : (
        <div className={`flex w-full items-center relative ${(type === 'image-caption' && !showImageCaptionInput) ? 'bg-white' : ''}`}>
          {type === 'image-caption' ? (
            showImageCaptionInput ? (
              <input
                type="text"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className={`w-full bg-transparent outline-none text-[26px] font-[400] ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
                placeholder="Add an Image caption"
              />
            ) : (
              <button
                onClick={() => setShowImageCaptionInput(true)}
                className={`flex items-center px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md ml-auto ${PRESSABLE_BTN}`}
              >
                Add an Image caption
              </button>
            )
          ) : (
            <TextareaAutosize
              wrap="hard"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className={`w-full bg-transparent outline-none resize-none overflow-hidden ${type === 'heading' ? 'text-[42px] font-playfair-display text-center' : ''} ${type === 'sub-heading' ? 'text-[32px] font-[600]' : ''} ${type === 'paragraph' ? 'text-[20px] font-[400]' : ''} ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
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
              className="absolute w-6 h-6 cursor-pointer text-red-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
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

export default function CreateBlogUtil() {
  const router = useRouter();
  const [elements, setElements] = useState([
    { id: uuidv4(), type: 'heading', content: '' },
    { id: uuidv4(), type: 'image-caption', content: '' },
    { id: uuidv4(), type: 'sub-heading', content: '' },
    { id: uuidv4(), type: 'divider' },
    { id: uuidv4(), type: 'paragraph', content: '' },
  ]);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const [showImageCaptionInput, setShowImageCaptionInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elementToDeleteId, setElementToDeleteId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleBackClick = () => {
    router.back();
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    const heading = elements.find((element) => element.type === 'heading')?.content ?? '';
    const imageCaption = elements.find((element) => element.type === 'image-caption')?.content ?? '';
    const filteredElements = elements
      .filter((element) => !['heading', 'image-caption'].includes(element.type))
      .map(({ id, ...rest }) => rest);
    const blog = {
      heading,
      imageCaption,
      imageUrl,
      timestamp: serverTimestamp(),
      elements: filteredElements
    };

    setIsPublishing(true);
    try {
      const docRef = await addDoc(collection(db, 'blog'), blog);
      console.log('Document written with ID: ', docRef.id);
      router.push('/');
    } catch (e) {
      console.error('Error adding document: ', e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const uniqueFileName = `blogImages/${uuidv4()}.jpg`;
      const storageRef = ref(storage, uniqueFileName);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
    }
  };

  const handleAddElement = (type) => {
    setElements((prevElements) => [...prevElements, { id: uuidv4(), type, content: '' }]);
    setShowOptions((prev) => !prev);
  };

  const handleElementChange = (id, content) => {
    setElements((prevElements) =>
      prevElements.map((element) => (element.id === id ? { ...element, content } : element))
    );
  };

  const handleDeleteElement = (id) => {
    setElementToDeleteId(id);
    setIsModalOpen(true);
  };

  const confirmDeleteElement = () => {
    setElements((prevElements) =>
      prevElements.map((element) => {
        if (element.id === elementToDeleteId && element.type === 'image-caption') {
          return { ...element, content: '' };
        }
        return element.id === elementToDeleteId ? null : element;
      }).filter(element => element !== null)
    );
    setIsModalOpen(false);
  };

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const confirmationModal = isModalOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-md shadow-md w-[567px]">
          <h2 className="text-xl font-semibold mb-4">Are you sure you want to remove this element</h2>
          <p className="text-gray-600 mb-6">All the contents of the selected element will be deleted.</p>
          <div className="flex justify-center space-x-35 pb-2">
            <button
              onClick={confirmDeleteElement}
              className={`w-full py-2 bg-[#86005E] text-white rounded-md ${PRESSABLE_BTN}`}
            >
              Yes, remove element
            </button>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className={`w-full py-2 bg-gray-200 rounded-md ${PRESSABLE_BTN}`}
            >
              Discard
            </button>
          </div>
        </div>
      </div>
  ) : null;

  const blogFrame = (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-center">
      <div className="mt-36 w-full flex flex-col items-center">
        {elements.map((element, index) => {
          if (element.type === 'heading') {
            return (
              <div key={element.id} className="w-[70vw] mb-8">
                <CreateBlogElement
                  id={element.id}
                  type={element.type}
                  content={element.content}
                  showImageCaptionInput={showImageCaptionInput}
                  setShowImageCaptionInput={setShowImageCaptionInput}
                  onContentChange={(value) => handleElementChange(element.id, value)}
                  onDeleteElement={() => handleDeleteElement(element.id)}
                />
              </div>
            );
          }
          return null;
        })}

        <div className="w-[862px] flex flex-col items-start gap-8">
          <div className="w-[862px] flex flex-col items-start gap-5">
            <div>
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="fileInput" className="group box-border w-[862px] h-[300px] flex justify-center items-center cursor-pointer rounded-[12px] overflow-hidden transition-all duration-300 hover:brightness-95">
                {imageUrl ? (
                  <img src={imageUrl} alt="Hero" className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90" loading="lazy" />
                ) : (
                  <div className="flex flex-col items-center border-2 border-dashed border-[rgba(0,0,0,0.3)] rounded-[12px] w-[800px] h-[300px] transition-all duration-200 group-hover:bg-black/5">
                    <ArrowUpload24Regular className="text-[#44294B] w-[54px] h-[54px] mt-[100px]" />
                    <div className="text-[#44294B] text-[24px] font-[500]">Upload a Hero Image</div>
                    <div className="text-[#666666] text-[14px] text-center w-[536px]">
                      You can upload PNG or JPEG Image. Minimum dimensions must be 500px X 500px
                    </div>
                  </div>
                )}
              </label>
            </div>
            <div className="relative w-[862px] h-9 flex flex-row justify-between items-center gap-5">
              {elements.map((element, index) => {
                if (element.type === 'image-caption') {
                  return (
                    <div key={element.id} className="relative flex flex-grow bg-white border-b border-gray-400">
                      <CreateBlogElement
                        id={element.id}
                        type={element.type}
                        content={element.content}
                        showImageCaptionInput={showImageCaptionInput}
                        setShowImageCaptionInput={setShowImageCaptionInput}
                        onContentChange={(value) => handleElementChange(element.id, value)}
                        onDeleteElement={() => handleDeleteElement(element.id)}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>

        <div className="relative w-full flex justify-center mt-8">
          <div className="w-[862px]">
            {elements.map((element, index) => {
              if (element.type !== 'heading' && element.type !== 'image-caption') {
                return (
                  <CreateBlogElement
                    key={element.id}
                    id={element.id}
                    type={element.type}
                    content={element.content}
                    showImageCaptionInput={showImageCaptionInput}
                    setShowImageCaptionInput={setShowImageCaptionInput}
                    onContentChange={(value) => handleElementChange(element.id, value)}
                    onDeleteElement={() => handleDeleteElement(element.id)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5">
        <button
          className={`box-border flex flex-row justify-center items-center p-[24px_24px] gap-[8px] w-[187px] h-[50px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[100px] ${PRESSABLE_BTN}`}
          onClick={toggleOptions}
        >
          <span className="text-[16px] whitespace-nowrap font-normal font-geist-variable text-[#333333]">Add element</span>
          <Add16Regular className="w-[20px] h-[20px]" />
        </button>
        {showOptions && (
          <div
            ref={optionsRef}
            className="fixed bottom-20 right-20"
          >
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddElement('sub-heading')}
            >
              Sub-heading
            </div>
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddElement('paragraph')}
            >
              Paragraph
            </div>
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddElement('divider')}
            >
              Divider
            </div>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="relative bg-white font-geist-variable">
      <div className="relative w-full h-screen bg-white">
        <div className="absolute z-20 w-full h-[105px] left-0 top-0 flex flex-col items-start border-b border-black/[0.06]">
          <div className="flex flex-row justify-between items-center w-full h-[105px] bg-[#F4F4F4] p-8">
            <div className="flex flex-row items-center gap-3">
              <ChevronLeft24Regular className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70" onClick={handleBackClick} />
              <span className="text-2xl font-normal">Blog Editor</span>
            </div>
            <div className="flex flex-row justify-end items-center gap-3">
              <button
                type="button"
                className={`flex flex-row justify-center items-center px-6 py-3 bg-white rounded-md ${PRESSABLE_BTN}`}
              >
                <span className="text-sm font-normal text-[#333333]">Save as Draft</span>
              </button>
              <button
                type="button"
                disabled={isPublishing}
                className={`flex min-w-[148px] flex-row justify-center items-center gap-2 px-5 py-3 bg-[#86005E] rounded-md disabled:cursor-wait disabled:opacity-90 ${PRESSABLE_BTN}`}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <ClipLoader size={20} color="#ffffff" />
                ) : (
                  <span className="text-sm font-normal text-white">Publish Blog</span>
                )}
              </button>
            </div>
          </div>
        </div>
        {blogFrame}
        {confirmationModal}
      </div>
    </div>
  );
}
