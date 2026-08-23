import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Course } from '../types';
import { CheckCircle2, ArrowRight, BookOpen, Calendar, MapPin, Sparkles } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}`)
        .then((res) => res.json())
        .then((data) => {
          setCourse(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [courseId]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" /> 訂單已確認
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            感謝您的報名與訂閱！
          </h1>
          <p className="text-slate-500 text-sm">
            我們已收到您的訂單資訊，確認信件與課程上課指南已發送至您的 Email。
          </p>
        </div>

        {loading ? (
          <div className="py-6 text-slate-400 text-sm">載入課程資訊中...</div>
        ) : (
          course && (
            <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800">
                  {course.category}
                </span>
                <span className="text-xs text-slate-400">ID: {sessionId?.slice(0, 16) || course.id}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
              <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                {course.startDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>日期：{course.startDate} {course.endDate ? `~ ${course.endDate}` : ''}</span>
                  </div>
                )}
                {course.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>地點：{course.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>費用：NT$ {course.price.toLocaleString()} {course.type === 'online' ? '/ 月' : ''}</span>
                </div>
              </div>
            </div>
          )
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            返回首頁
          </Link>
          <Link
            to={course?.type === 'physical' ? '/physical-courses' : '/online-courses'}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
          >
            探索更多課程
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
