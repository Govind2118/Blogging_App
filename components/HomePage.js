"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Add16Regular } from '@fluentui/react-icons';
import { ClipLoader } from 'react-spinners';
import Blog from '../components/Blog';
import { db, storage } from '../firebase';

const HERO_COPY = {
  title: 'Investor Daily India',
  subtitle: 'A blog sharing the daily updates in Indian Real Estate and Investment markets.',
};

const preloadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = () => reject(new Error('Background image failed to load'));
    img.src = url;
  });

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backgroundPhase, setBackgroundPhase] = useState('checking');
  const [navigatingCreate, setNavigatingCreate] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true);
      try {
        const blogsSnapshot = await getDocs(collection(db, 'blog'));
        const blogsList = blogsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const handleCreateNewBlog = () => {
    setNavigatingCreate(true);
    router.push('/createBlog');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
  };

  const heroStyle = useMemo(() => {
    if (backgroundPhase !== 'ready' || !backgroundUrl) return undefined;
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.38)), url(${backgroundUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }, [backgroundPhase, backgroundUrl]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F1F1F]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#F4F4F4]/95 backdrop-blur">
        <div className="flex min-h-[84px] items-center justify-between gap-6 py-4 px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Investor Daily Dubai logo" className="h-12 w-auto sm:h-14" />
          </div>

          <nav className="hidden items-center gap-7 text-sm text-[#333333] md:flex">
            <a href="#" className="hover:text-black">Home</a>
            <a href="#" className="hover:text-black">About</a>
            <a href="#" className="hover:text-black">Listings</a>
            <a href="#" className="hover:text-black">FAQ</a>
            <button type="button" className="pressable-btn rounded-md bg-[#333333] px-4 py-2 text-white">
              Contact us
            </button>
          </nav>
        </div>
      </header>

      <section className={`border-b border-black/5 ${backgroundPhase === 'ready' && backgroundUrl ? '' : 'bg-[#8B8B8B]'}`} style={heroStyle}>
        <div className="page-shell flex min-h-[420px] flex-col justify-between gap-10 py-8 sm:min-h-[500px] sm:py-10 lg:min-h-[560px]">
          <div className="flex justify-end">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />

            {backgroundPhase === 'checking' ? (
              <div className="inline-flex items-center gap-3 rounded-md bg-black/25 px-4 py-2.5 text-white backdrop-blur-sm">
                <ClipLoader size={16} color="#ffffff" />
              </div>
            ) : backgroundPhase === 'absent' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingBackground}
                className="pressable-btn inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm text-[#222222] shadow-sm"
              >
                {uploadingBackground ? (
                  <>
                    <ClipLoader size={16} color="#222222" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <span>Add a blog background</span>
                )}
              </button>
            ) : null}
          </div>

          <div className="max-w-3xl space-y-5 pb-4 text-white sm:space-y-6 sm:pb-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{HERO_COPY.title}</h1>
              <p className="max-w-2xl text-base leading-8 text-white/90 sm:text-lg">{HERO_COPY.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreateNewBlog}
                disabled={navigatingCreate}
                className="pressable-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm text-[#333333]"
              >
                {navigatingCreate ? (
                  <ClipLoader size={16} color="#333333" />
                ) : (
                  <>
                    <span>Create new blog</span>
                    <Add16Regular primaryFill="#333333" className="h-5 w-5" />
                  </>
                )}
              </button>

              <button type="button" className="rounded-full bg-white/95 px-5 py-3 text-sm text-[#666666] shadow-sm">
                Manage Subscribers • 12.3K
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="page-shell py-10 sm:py-12">
        {blogsLoading ? (
          <div className="surface-card flex min-h-[320px] items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <ClipLoader size={40} color="#86005E" />
              <p className="text-sm text-[#666666]">Loading blogs…</p>
            </div>
          </div>
        ) : blogs.length > 0 ? (
          <div className="flex flex-col gap-6">
            {blogs.map((blog) => (
              <Blog key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="surface-card flex min-h-[260px] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-[#222222]">Start with your first blog</h2>
              <p className="text-sm text-[#666666]">Create a post to begin building out your homepage.</p>
            </div>
            <button
              type="button"
              onClick={handleCreateNewBlog}
              disabled={navigatingCreate}
              className="pressable-btn inline-flex items-center justify-center gap-2 rounded-full bg-[#F4F4F4] px-5 py-3 text-sm text-[#333333]"
            >
              {navigatingCreate ? (
                <ClipLoader size={16} color="#333333" />
              ) : (
                <>
                  <span>Create new blog</span>
                  <Add16Regular primaryFill="#333333" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;