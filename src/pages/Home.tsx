import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Course, AppConfig } from '../types';
import CourseCard from '../components/CourseCard';
import { formatImageUrl } from '../utils/imageUtils';
import { Users, MonitorPlay, ChevronLeft, ChevronRight, Award, ShieldCheck, HeartHandshake, Lightbulb } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(console.error);

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error);
  }, []);

  const rawBanners = config?.homeBanners?.length
    ? config.homeBanners
    : ['https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=1600'];

  const banners = rawBanners.map((b) => {
    if (typeof b === 'string') {
      return { image: b, linkUrl: '' };
    }
    return { image: b?.image || '', linkUrl: b?.linkUrl || '' };
  });

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const physicalCourses = courses.filter((c) => c.type === 'physical');
  const onlineCourses = courses.filter((c) => c.type === 'online');

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Carousel */}
      <div className="relative w-full aspect-21/9 md:aspect-24/9 max-h-[520px] overflow-hidden bg-slate-900 shadow-lg">
        {banners.map((banner, idx) => {
          const isExternal = banner.linkUrl?.startsWith('http://') || banner.linkUrl?.startsWith('https://');
          const hasLink = Boolean(banner.linkUrl?.trim());

          const imageContent = (
            <img
              src={formatImageUrl(banner.image)}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.01]"
            />
          );

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentBannerIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {hasLink ? (
                isExternal ? (
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer"
                    title={`前往連結：${banner.linkUrl}`}
                  >
                    {imageContent}
                  </a>
                ) : (
                  <Link
                    to={banner.linkUrl!}
                    className="block w-full h-full cursor-pointer"
                    title={`前往頁面：${banner.linkUrl}`}
                  >
                    {imageContent}
                  </Link>
                )
              ) : (
                imageContent
              )}
            </div>
          );
        })}

        {/* Carousel Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentBannerIdx((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all"
              aria-label="Next banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentBannerIdx ? 'bg-amber-400 w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Core Advantages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-slate-900 leading-snug">生活化理財教學</h3>
              <p className="text-[18px] text-slate-600 mt-2 leading-relaxed">從日常生活情境出發，讓孩子學會分辨想要與需要，建立自律金錢觀念。</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-slate-900 leading-snug">實戰作品與成果產出</h3>
              <p className="text-[18px] text-slate-600 mt-2 leading-relaxed">每堂課程皆能產出專屬手作帳本、創意商業提案或理財桌遊實踐體驗。</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-slate-900 leading-snug">雙師小班制度</h3>
              <p className="text-[18px] text-slate-600 mt-2 leading-relaxed">實體營隊每班配置專業講師與助教，全程細心關照學員進度。</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-[24px] font-bold text-slate-900 leading-snug">安心安全環境</h3>
              <p className="text-[18px] text-slate-600 mt-2 leading-relaxed">高規格教學場地，配有專屬數位平台與家長課後學習反饋。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Physical Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>實體互動體驗</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              熱門實體營隊與週末工作坊
            </h2>
          </div>
          <Link
            to="/physical-courses"
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            查看全部實體課程
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {physicalCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Featured Online Subscriptions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <MonitorPlay className="w-4 h-4" />
              <span>在家隨選隨學</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              線上訂閱暢學專區
            </h2>
          </div>
          <Link
            to="/online-courses"
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            查看全部線上課程
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {onlineCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
