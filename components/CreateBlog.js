import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '../firebase';
import BlogEditorElement from './editor/BlogEditorElement';
import DeleteConfirmationModal from './editor/DeleteConfirmationModal';
import AddElementMenu from './editor/AddElementMenu';
import EditorHeader from './editor/EditorHeader';
import HeroImageUploader from './editor/HeroImageUploader';

const INITIAL_ELEMENTS = [
  { id: uuidv4(), type: 'heading', content: '' },
  { id: uuidv4(), type: 'image-caption', content: '' },
  { id: uuidv4(), type: 'sub-heading', content: '' },
  { id: uuidv4(), type: 'divider' },
  { id: uuidv4(), type: 'paragraph', content: '' },
];

const CreateBlogUtil = () => {
  const router = useRouter();
  const optionsRef = useRef(null);
  const [elements, setElements] = useState(INITIAL_ELEMENTS);
  const [showOptions, setShowOptions] = useState(false);
  const [showImageCaptionInput, setShowImageCaptionInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elementToDeleteId, setElementToDeleteId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    const heading = elements.find((element) => element.type === 'heading')?.content ?? '';
    const imageCaption = elements.find((element) => element.type === 'image-caption')?.content ?? '';
    const filteredElements = elements
      .filter((element) => !['heading', 'image-caption'].includes(element.type))
      .map(({ id: _id, ...rest }) => rest);

    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'blog'), {
        heading,
        imageCaption,
        imageUrl,
        timestamp: serverTimestamp(),
        elements: filteredElements,
      });
      router.push('/');
    } catch (e) {
      console.error('Error adding document: ', e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uniqueFileName = `blogImages/${uuidv4()}.jpg`;
    const storageRef = ref(storage, uniqueFileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setImageUrl(url);
    event.target.value = '';
  };

  const handleAddElement = (type) => {
    setElements((prevElements) => [...prevElements, { id: uuidv4(), type, content: '' }]);
    setShowOptions(false);
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
      prevElements
        .map((element) => {
          if (element.id === elementToDeleteId && element.type === 'image-caption') {
            return { ...element, content: '' };
          }
          return element.id === elementToDeleteId ? null : element;
        })
        .filter((element) => element !== null)
    );
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderElement = (element) => (
    <BlogEditorElement
      key={element.id}
      type={element.type}
      content={element.content}
      showImageCaptionInput={showImageCaptionInput}
      setShowImageCaptionInput={setShowImageCaptionInput}
      onContentChange={(value) => handleElementChange(element.id, value)}
      onDeleteElement={() => handleDeleteElement(element.id)}
    />
  );

  return (
    <div className="relative min-h-screen bg-white">
      <EditorHeader
        isSaving={isPublishing}
        saveButtonLabel="Publish Blog"
        onBack={() => router.back()}
        onSave={handlePublish}
      />

      <div className="relative flex min-h-screen w-full flex-col items-center bg-white font-geist-variable">
        <div className="mt-36 flex w-full flex-col items-center">
          <div className="mb-4 w-full max-w-4xl px-4 sm:px-6">
            {elements.filter((element) => element.type === 'heading').map(renderElement)}
          </div>

          <div className="flex w-full max-w-4xl flex-col items-start gap-8">
            <HeroImageUploader imageUrl={imageUrl} onFileChange={handleFileChange} />
            <div className="relative min-h-9 w-full max-w-4xl border-b border-gray-400 bg-white">
              {elements.filter((element) => element.type === 'image-caption').map(renderElement)}
            </div>
          </div>

          <div className="relative mt-8 flex w-full justify-center">
            <div className="w-full max-w-4xl">
              {elements
                .filter((element) => element.type !== 'heading' && element.type !== 'image-caption')
                .map(renderElement)}
            </div>
          </div>
        </div>

        <AddElementMenu
          showOptions={showOptions}
          optionsRef={optionsRef}
          onToggle={() => setShowOptions((prev) => !prev)}
          onAddElement={handleAddElement}
        />
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onConfirm={confirmDeleteElement}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default CreateBlogUtil;
