import { useRouter } from 'next/navigation';
import { ChevronLeft24Regular, ArrowUpload24Regular, Add16Regular, Delete24Regular } from '@fluentui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import TextareaAutosize from 'react-textarea-autosize';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { ClipLoader } from 'react-spinners';

const PRESSABLE_BTN =
    'transition-all duration-150 active:translate-y-[2px]';

const EditBlogElement = ({
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
                <div className={`flex w-full items-center relative ${(type === 'image-caption' && !showImageCaptionInput) ? 'bg-gray-100' : ''}`}>
                    {type === 'image-caption' ? (
                        showImageCaptionInput ? (
                            <input
                                type="text"
                                value={content}
                                onChange={(e) => onContentChange(e.target.value)}
                                className={`w-full bg-transparent outline-none text-[26px] font-geist-variable ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
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
                            className={`w-full bg-transparent outline-none resize-none overflow-hidden ${type === 'heading' ? 'font-playfair-display text-[42px] font-normal text-center leading-[55.99px]' : ''} ${type === 'sub-heading' ? 'font-geist-variable text-[32px] font-[600]' : ''} ${type === 'paragraph' ? 'font-geist-variable text-[20px] font-[400]' : ''} ${content ? 'text-black' : 'text-[#AAAAAA]'}`}
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

const EditBlog = ({ id }) => {
    const router = useRouter();
    const [elements, setElements] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
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
                    setShowImageCaptionInput(!!(blogData.imageCaption && blogData.imageCaption !== ''));
                } else {
                    console.log('No such document!');
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

    const handleBackClick = () => {
        router.back();
    };

    const handleSave = async () => {
        if (isSaving) return;
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

        setIsSaving(true);
        try {
            const docRef = doc(db, 'blog', id);
            await updateDoc(docRef, blog);
            router.push('/');
        } catch (e) {
            console.error('Error updating document: ', e);
        } finally {
            setIsSaving(false);
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
        <div className="relative w-full min-h-screen bg-white flex flex-col items-center font-geist-variable">
            <div className="mt-36 w-full flex flex-col items-center">
                {elements.map((element, index) => {
                    if (element.type === 'heading') {
                        return (
                            <div key={element.id} className="w-[70vw] mb-8">
                                <EditBlogElement
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
                            <label htmlFor="fileInput" className="group box-border w-[862px] h-[350px] flex justify-center items-center cursor-pointer rounded-[12px] overflow-hidden transition-all duration-300 hover:brightness-95">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Hero" className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90" loading="lazy" />
                                ) : (
                                    <div className="flex flex-col items-center gap-6 border-2 border-dashed border-[rgba(0,0,0,0.3)] rounded-[12px] transition-all duration-200 group-hover:bg-black/5">
                                        <ArrowUpload24Regular className="text-[#44294B] w-[54px] h-[54px]" />
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
                                            <EditBlogElement
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
                    <div className="w-[900px]">
                        {elements.map((element, index) => {
                            if (element.type !== 'heading' && element.type !== 'image-caption') {
                                return (
                                    <EditBlogElement
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
                    className={`box-border flex flex-row justify-center items-center p-[17px_32px] gap-[12px] w-[187px] h-[50px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[100px] ${PRESSABLE_BTN}`}
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


    const loadingScreen = (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white">
            <ClipLoader size={40} color="#86005E" />
            <p className="mt-5 text-[15px] font-geist-variable text-[#666666]">Loading editor…</p>
        </div>
    );

    if (!id || id === '') {
        return loadingScreen;
    }

    if (isLoadingBlog) {
        return loadingScreen;
    }

    if (blogMissing) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6">
                <p className="text-center text-xl font-geist-variable text-[#222222]">This blog could not be found.</p>
                <p className="text-center text-[15px] text-[#666666]">It may have been removed or the link is incorrect.</p>
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
        <div className="relative w-full h-screen bg-white">
            <div className="relative w-full h-screen bg-white">
                <div className="absolute w-full h-[105px] left-0 top-0 z-20 flex flex-col items-start border-b border-black/[0.06]">
                    <div className="flex flex-row justify-between items-center w-full h-[105px] bg-[#F4F4F4] p-8">
                        <div className="flex flex-row items-center gap-3">
                            <ChevronLeft24Regular className="w-6 h-6 cursor-pointer transition-opacity hover:opacity-70" onClick={handleBackClick} />
                            <span className="text-2xl font-geist-variable">Blog Editor</span>
                        </div>
                        <div className="flex flex-row justify-end items-center gap-3">
                            <button
                                type="button"
                                className={`flex flex-row justify-center items-center px-6 py-3 bg-white rounded-md ${PRESSABLE_BTN}`}
                            >
                                <span className="text-sm font-geist-variable text-[#333333]">Save as Draft</span>
                            </button>
                            <button
                                type="button"
                                disabled={isSaving}
                                className={`flex min-w-[148px] flex-row justify-center items-center gap-2 px-5 py-3 bg-[#86005E] rounded-md disabled:cursor-wait disabled:opacity-90 ${PRESSABLE_BTN}`}
                                onClick={handleSave}
                            >
                                {isSaving ? (
                                    <ClipLoader size={16} color="#ffffff" />
                                ) : (
                                    <span className="text-sm font-geist-variable text-white">Publish Blog</span>
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

export default EditBlog;
