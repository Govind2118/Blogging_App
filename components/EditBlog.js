import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { ClipLoader } from 'react-spinners';
import { db, storage } from '../firebase';
import BlogEditorElement from './editor/BlogEditorElement';
import DeleteConfirmationModal from './editor/DeleteConfirmationModal';
import AddElementMenu from './editor/AddElementMenu';
import EditorHeader from './editor/EditorHeader';
import HeroImageUploader from './editor/HeroImageUploader';
import { PRESSABLE_BTN } from './editor/constants';

const EditBlogUtil = ({ id }) => {
  const router = useRouter();
  const optionsRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showImageCaptionInput, setShowImageCaptionInput] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [elementToDeleteId, setElementToDeleteId] = useState(null);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [blogMissing, setBlogMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchBlog = async () => {
      setIsLoadingBlog(true);
      setBlogMissing(false);

      try {
        const docRef = doc(db, 'blog', id);
        const docSnap = await getDoc(docRef);
        if (cancelled) return;

        if (docSnap.exists()) {
          const blogData = docSnap.data();
          setElements([
            { id: uuidv4(), type: 'heading', content: blogData.heading ?? '' },
            { id: uuidv4(), type: 'image-caption', content: blogData.imageCaption ?? '' },
            ...(blogData.elements || []).map((el) => ({ id: uuidv4(), ...el })),
          ]);
          setImageUrl(blogData.imageUrl ?? null);
          setShowImageCaptionInput(Boolean(blogData.imageCaption && blogData.imageCaption !== ''));
        } else {
          setBlogMissing(true);
        }
      } catch (e) {
        console.error('Error loading blog:', e);
        if (!cancelled) setBlogMissing(true);
      } finally {
        if (!cancelled) setIsLoadingBlog(false);
      }
    };

    fetchBlog();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    if (isSaving) return;
    const heading = elements.find((element) => element.type === 'heading')?.content ?? '';
    const imageCaption = elements.find((element) => element.type === 'image-caption')?.content ?? '';
    const filteredElements = elements
      .filter((element) => !['heading', 'image-caption'].includes(element.type))
      .map(({ id: _id, ...rest }) => rest);

    setIsSaving(true);
    try {
      const docRef = doc(db, 'blog', id);
      await updateDoc(docRef, {
        heading,
        imageCaption,
        imageUrl,
        timestamp: serverTimestamp(),
        elements: filteredElements,
      });
      router.push('/');
    } catch (e) {
      console.error('Error updating document: ', e);
    } finally {
      setIsSaving(false);
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

  const loadingScreen = (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <ClipLoader size={40} color="#86005E" />
      <p className="mt-5 text-[15px] font-geist-variable text-[#666666]">Loading editor...</p>
    </div>
  );

  if (!id || id === '' || isLoadingBlog) return loadingScreen;

  if (blogMissing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6">
        <p className="text-center text-xl font-geist-variable text-[#222222]">This blog could not be found.</p>
        <p className="text-center text-[15px] text-[#666666]">
          It may have been removed or the link is incorrect.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className={`rounded-md bg-[#86005E] px-6 py-3 text-sm font-geist-variable text-white ${PRESSABLE_BTN}`}
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <EditorHeader
        isSaving={isSaving}
        saveButtonLabel="Publish Blog"
        onBack={() => router.back()}
        onSave={handleSave}
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
};

export default EditBlogUtil;
