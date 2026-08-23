import { useState } from 'react';
import { Course } from '../types';
import { formatImageUrl } from '../utils/imageUtils';
import { Calendar, MapPin, Clock, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('結帳頁面載入失敗，請稍後再試。');
      }
    } catch (err) {
      console.error(err);
      alert('發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const isSubscription = course.type === 'online';

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
          <img
            src={formatImageUrl(course.image)}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800';
            }}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-white shadow-xs">
              {course.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5 sm:p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {course.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-grow">
            {course.description}
          </p>

          {/* Metadata */}
          <div className="space-y-1.5 text-xs text-slate-500 mb-5 border-t border-slate-100 pt-3">
            {course.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>課程時數：{course.duration}</span>
              </div>
            )}
            {course.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>開課日期：{course.startDate} {course.endDate ? `~ ${course.endDate}` : ''}</span>
              </div>
            )}
            {course.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>上課地點：{course.location}</span>
              </div>
            )}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                {isSubscription ? '月訂閱費' : '單人費用'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-amber-600">NT$</span>
                <span className="text-2xl font-black text-slate-900">
                  {course.price.toLocaleString()}
                </span>
                {isSubscription && <span className="text-xs text-slate-500 font-normal">/ 月</span>}
              </div>
            </div>

            <button
              onClick={handleEnroll}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSubscription ? '立即訂閱' : '立即報名'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
          >
            {/* Modal Header Image */}
            <div className="relative aspect-16/9 bg-slate-100">
              <img
                src={formatImageUrl(course.image)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white shadow-md">
                  {course.category}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {course.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-black text-slate-900">{course.title}</h2>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 space-y-2.5 text-sm text-slate-700">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>課程時數：</strong>{course.duration}</span>
                  </div>
                )}
                {course.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>開課期間：</strong>{course.startDate} {course.endDate ? `至 ${course.endDate}` : ''}</span>
                  </div>
                )}
                {course.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>上課地點：</strong>{course.location}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  課程詳細說明
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {course.details || course.description}
                </p>
              </div>

              {/* Course Highlights */}
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">課程特色</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 小班制精緻互動教學
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 結合 AI 科技實戰啟發
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 課後作品完整成果展示
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" /> 專屬助教群線上即時答疑
                  </li>
                </ul>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {isSubscription ? '月訂閱費' : '報名費用'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-amber-600">NT$</span>
                    <span className="text-3xl font-black text-slate-900">
                      {course.price.toLocaleString()}
                    </span>
                    {isSubscription && <span className="text-sm text-slate-500 font-normal">/ 月</span>}
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isSubscription ? '前往訂閱' : '前往報名結帳'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
