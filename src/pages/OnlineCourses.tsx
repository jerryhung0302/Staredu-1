import { useEffect, useState } from 'react';
import { Course, AppConfig } from '../types';
import CourseCard from '../components/CourseCard';
import { formatImageUrl } from '../utils/imageUtils';
import { MonitorPlay, Filter, CheckCircle2, Zap } from 'lucide-react';

export default function OnlineCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/courses?type=online')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(console.error);

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error);
  }, []);

  const bannerImg =
    config?.onlineBanner ||
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1600';

  const categories = ['all', ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses =
    selectedCategory === 'all'
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-12 pb-20">
      {/* Top Banner */}
      <div className="relative aspect-21/9 md:aspect-24/9 max-h-[360px] w-full overflow-hidden bg-slate-900 shadow-md">
        <img
          src={formatImageUrl(bannerImg)}
          alt="線上訂閱課程 Banner"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Subscription Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl p-6 sm:p-8 border border-amber-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>為什麼選擇小管家兒童理財線上訂閱？</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              每月自動續約，隨時可取消，享受無負擔的高品質科技教育
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>每週解鎖全新原創實作單元</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>助教線上一對一作業批改與指導</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>隨時隨地可登入電腦或平板學習</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            分類篩選：
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? '全部訂閱' : cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 p-8">
            <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">目前尚無相關線上課程</h3>
            <p className="text-sm text-slate-400 mt-1">請稍後再試或調整篩選條件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
