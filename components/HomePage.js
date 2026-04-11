"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '../firebase';
import Blog from '../components/Blog';
import { collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Add16Regular } from '@fluentui/react-icons';
import { ClipLoader } from 'react-spinners';

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Background image failed to load'));
    img.src = url;
  });
}

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  /** Resolves only after we know whether a hero image is usable (URL + decode). */
  const [backgroundPhase, setBackgroundPhase] = useState('checking');
  const [navigatingCreate, setNavigatingCreate] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true);
      try {
        const blogsCollection = collection(db, 'blog');
        const blogsSnapshot = await getDocs(blogsCollection);
        const blogsList = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBlogs(blogsList);
      } finally {
        setBlogsLoading(false);
      }
    };

    const fetchBackgroundImage = async () => {
      setBackgroundPhase('checking');
      try {
        const storageRef = ref(storage, 'backgrounds/backgroundImage.jpg');
        const url = await getDownloadURL(storageRef);
        await preloadImage(url);
        setBackgroundUrl(url);
        setBackgroundPhase('ready');
      } catch (error) {
        console.error('Error fetching background image:', error);
        setBackgroundUrl('');
        setBackgroundPhase('absent');
      }
    };

    fetchBlogs();
    fetchBackgroundImage();
  }, []);

  const Navigation = () => {
    return (
      <div className="flex flex-row justify-between items-center p-4 gap-[994px] fixed w-full h-[100px] top-0 bg-[#F4F4F4] z-50">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-[60px]" />
        </div>
        <div className="flex items-center space-x-8">
          <a href="#" className="text-black">Home</a>
          <a href="#" className="text-black">About</a>
          <a href="#" className="text-black">Listings</a>
          <a href="#" className="text-black">FAQ</a>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">Contact us</button>
        </div>
      </div>
    );
  };

  const handleCreateNewBlog = () => {
    setNavigatingCreate(true);
    router.push('/createBlog');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingBackground(true);
      setBackgroundPhase('checking');
      try {
        const storageRef = ref(storage, 'backgrounds/backgroundImage.jpg');
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await preloadImage(url);
        setBackgroundUrl(url);
        setBackgroundPhase('ready');
      } catch (error) {
        console.error('Error uploading background:', error);
        setBackgroundUrl('');
        setBackgroundPhase('absent');
      } finally {
        setUploadingBackground(false);
        event.target.value = '';
      }
    }
  };

  const MainLayout = () => {
    const openFilePicker = () => {
      document.getElementById('fileInput').click();
    };

    const showHeroImage = backgroundPhase === 'ready' && backgroundUrl;

    return (
      <div
        className={`relative mt-[100px] w-full h-[60vh] overflow-hidden drop-shadow-md z-10 transition-[background-color,opacity] duration-500 ease-out ${!showHeroImage ? 'bg-[#888888]' : ''}`}
        style={
          showHeroImage
            ? {
                backgroundImage: `url(${backgroundUrl})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
              }
            : undefined
        }
      >
        <input type="file" id="fileInput" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />

        {backgroundPhase === 'checking' && (
          <div className="absolute right-[24.72px] top-[24.19px] flex items-center gap-3 rounded-[6px] bg-black/25 px-4 py-2.5 text-white backdrop-blur-sm">
            <ClipLoader size={16} color="#ffffff" />
          </div>
        )}

        {backgroundPhase === 'absent' && (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploadingBackground}
            className="absolute flex items-center justify-center gap-2 p-[15px_20px_15px_24px] min-w-[221px] h-[49px] right-[24.72px] top-[24.19px] bg-white rounded-[6px] shadow-sm transition-opacity duration-200 disabled:cursor-wait disabled:opacity-80 hover:shadow-md"
          >
            {uploadingBackground ? (
              <>
                <ClipLoader size={16} color="#222222" />
                <div className="text-[16px] font-[400] text-[#222222]">Uploading…</div>
              </>
            ) : (
              <div className="text-[16px] font-[400] text-[#222222]">Add a blog background</div>
            )}
          </button>
        )}

        <div className="relative z-10 mt-[120px] ml-[100px] font-playfair-display font-semibold text-[54px] leading-[72px] text-white">
          Investor Daily Dubai
        </div>

        <div className="relative z-10 ml-[100px] font-['Geist Variable'] font-normal text-[20px] leading-[170%] text-[#F4F4F4]">
          A blog sharing the daily updates in Dubai Real Estate and Investment markets.
        </div>

        <div className="relative z-10 flex flex-row justify-center items-center ml-[100px] mt-[30px] w-fit gap-[20px]">
          <button
            type="button"
            onClick={handleCreateNewBlog}
            disabled={navigatingCreate}
            className="flex flex-row justify-center items-center p-[15px_20px_15px_24px] gap-[6px] h-[50px] bg-white rounded-[100px] focus:outline-none cursor-pointer active:scale-90 hover:shadow-[0_2px_6px_rgba(239,68,68,0.6)] active:shadow-[0_2px_6px_rgba(239,68,68,0.6)] transition-all duration-150 disabled:cursor-wait disabled:active:scale-100 disabled:opacity-90"
          >
            {navigatingCreate ? (
              <ClipLoader size={16} color="#333333" />
            ) : (
              <>
                <div className="text-[14px] font-['Geist Variable'] font-normal text-[#333333]">
                  Create new blog
                </div>
                <Add16Regular primaryFill="#333333" className="w-[20px] h-[20px]" />
              </>
            )}
          </button>
          <button className="text-[14px] font-['Geist Variable'] p-[15px_20px_15px_24px] bg-white rounded-[100px] focus:outline-none h-[50px]">
            <div className="text-[14px] font-['Geist Variable'] font-normal text-[#999999]">
              Manage Subscribers • 12.3K
            </div>
          </button>
        </div>
      </div>
    );
  };

  const BlogView = () => {
    return (
      <div className="flex justify-center z-30">

        {blogsLoading ? (
          <div className="relative flex w-full min-h-[320px] items-center justify-center bg-white py-16">
            <div className="flex flex-col items-center gap-4">
              <ClipLoader size={40} color="#86005E" />
              <p className="text-[15px] text-[#666666] font-['Geist Variable']">Loading blogs…</p>
            </div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="relative w-full bg-white pb-[100px] flex justify-center">
            <div className="flex flex-col items-start p-0 gap-[24px] w-[852px] pb-[100px]">
              <div></div>
              {blogs.map(blog => (
                <Blog key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[400px] bg-white">
            <div className="absolute w-full flex flex-col justify-center items-center top-[30px]">
              <div className="box-border flex flex-col justify-center items-center p-[42px_200px] gap-6 w-[1367px] h-[182px] border border-[rgba(0,0,0,0.2)] rounded-[24px] bg-white">
                <div className="text-[24px] font-[400]">
                  Start with your first blog!
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewBlog}
                  disabled={navigatingCreate}
                  className="flex flex-row justify-center items-center p-[15px_20px_15px_24px] gap-[6px] min-w-[192px] h-[50px] bg-[#F4F4F4] shadow-[0px_0px_40px_rgba(255,255,255,0.2),inset_0px_-2px_4px_rgba(0,0,0,0.1)] rounded-[100px] disabled:cursor-wait disabled:opacity-90 transition-opacity duration-150"
                >
                  {navigatingCreate ? (
                    <ClipLoader size={16} color="#333333" />
                  ) : (
                    <>
                      <div className="flex-none order-0 flex-grow-0 font-['Geist Variable'] font-normal text-[16px] leading-[100%] text-[#333333]">
                        Create new blog
                      </div>
                      <div className="flex-none order-1 flex-grow-0 w-[20px] h-[20px] flex items-center justify-center">
                        <Add16Regular primaryFill="#333333" />
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };


  return (
    <div className="relative font-geist-variable h-full">
      <Navigation />
      <MainLayout />
      <BlogView />
    </div>
  );
};

export default HomePage;
