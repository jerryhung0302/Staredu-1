import React, { useEffect, useState } from 'react';
import { AppConfig, BannerItem, Course } from '../types';
import { Plus, Trash2, Save, Image as ImageIcon, BookOpen, Tv, Layers, X, CheckCircle, AlertCircle, LogOut, Calendar, Info, Download, ExternalLink, Link2 } from 'lucide-react';
import { formatImageUrl } from '../utils/imageUtils';
import BrandLogo from '../components/BrandLogo';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [config, setConfig] = useState<{
    homeBanners: BannerItem[];
    physicalBanner: string;
    onlineBanner: string;
  }>({
    homeBanners: [{ image: '', linkUrl: '' }],
    physicalBanner: '',
    onlineBanner: ''
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'banners' | 'physical' | 'online'>('banners');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('staredu_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchData = async () => {
    try {
      const [configRes, coursesRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/courses')
      ]);

      if (!configRes.ok || !coursesRes.ok) {
        throw new Error('API 回應異常');
      }

      const configData = await configRes.json();
      const coursesData = await coursesRes.json();

      const rawHomeBanners = Array.isArray(configData?.homeBanners) ? configData.homeBanners : [];
      const parsedHomeBanners: BannerItem[] = rawHomeBanners.map((b: any) => {
        if (typeof b === 'string') {
          return { image: b || '', linkUrl: '' };
        }
        return { image: b?.image || '', linkUrl: b?.linkUrl || '' };
      });

      setConfig({
        homeBanners: parsedHomeBanners.length ? parsedHomeBanners : [{ image: '', linkUrl: '' }],
        physicalBanner: configData?.physicalBanner || '',
        onlineBanner: configData?.onlineBanner || ''
      });
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error('Fetch error in Admin:', err);
      showToast('資料載入失敗，請確認後端服務是否正常', 'error');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin pin/password is admin888
    if (password === 'admin888' || password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('staredu_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('密碼錯誤，請重新輸入 (預設密碼為 admin888)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('staredu_admin_auth');
  };

  const handleSaveConfig = async () => {
    try {
      setIsSavingConfig(true);
      const cleanBanners = (config.homeBanners || [])
        .map((b: any) => {
          if (typeof b === 'string') {
            return { image: b.trim(), linkUrl: '' };
          }
          return {
            image: String(b?.image || '').trim(),
            linkUrl: String(b?.linkUrl || '').trim()
          };
        })
        .filter((b) => b.image !== '');

      const payload = {
        homeBanners: cleanBanners.length ? cleanBanners : [{ image: '', linkUrl: '' }],
        physicalBanner: String(config.physicalBanner || '').trim(),
        onlineBanner: String(config.onlineBanner || '').trim()
      };

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('首頁橫幅與前往連結已成功儲存！');
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || '儲存失敗，請重試', 'error');
      }
    } catch (err: any) {
      console.error('Save config error:', err);
      showToast(err?.message || '儲存時發生網路錯誤', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleHomeBannerImageChange = (index: number, image: string) => {
    const next = [...config.homeBanners];
    next[index] = { ...(next[index] || { image: '', linkUrl: '' }), image };
    setConfig({ ...config, homeBanners: next });
  };

  const handleHomeBannerLinkChange = (index: number, linkUrl: string) => {
    const next = [...config.homeBanners];
    next[index] = { ...(next[index] || { image: '', linkUrl: '' }), linkUrl };
    setConfig({ ...config, homeBanners: next });
  };

  const handleAddHomeBanner = () => {
    setConfig({ ...config, homeBanners: [...config.homeBanners, { image: '', linkUrl: '' }] });
  };

  const handleRemoveHomeBanner = (index: number) => {
    const next = config.homeBanners.filter((_, i) => i !== index);
    setConfig({ ...config, homeBanners: next.length ? next : [{ image: '', linkUrl: '' }] });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    if (!editingCourse.title?.trim()) {
      showToast('請填寫課程標題', 'error');
      return;
    }
    if (!editingCourse.category?.trim()) {
      showToast('請填寫分類標籤', 'error');
      return;
    }
    if (editingCourse.price === undefined || isNaN(Number(editingCourse.price))) {
      showToast('請填寫有效的價格數值', 'error');
      return;
    }

    try {
      setIsSavingCourse(true);
      const isNew = !editingCourse.id;
      const url = isNew ? '/api/courses' : `/api/courses/${editingCourse.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const parsedTags = tagInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...editingCourse,
        title: editingCourse.title.trim(),
        category: editingCourse.category.trim(),
        price: Number(editingCourse.price) || 0,
        description: (editingCourse.description || '').trim(),
        image: (editingCourse.image || '').trim(),
        tags: parsedTags,
        duration: (editingCourse.duration || '').trim(),
        location: (editingCourse.location || '').trim(),
        details: (editingCourse.details || '').trim(),
        startDate: editingCourse.startDate || '',
        endDate: editingCourse.endDate || ''
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isNew ? '成功新增課程！' : '成功更新課程！');
        setIsModalOpen(false);
        setEditingCourse(null);
        setTagInput('');
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || '儲存課程失敗', 'error');
      }
    } catch (err: any) {
      console.error('Save course error:', err);
      showToast(err?.message || '儲存發生錯誤', 'error');
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`確定要刪除「${title}」嗎？此操作無法復原。`)) return;

    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('課程已刪除');
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || '刪除失敗', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('刪除發生錯誤', 'error');
    }
  };

  const openAddModal = (type: 'physical' | 'online') => {
    const defaultTags = type === 'physical' ? ['理財啟蒙', '情境桌遊', '小學 1-6 年級'] : ['每月扣款', '隨時觀看', '課後任務'];
    setEditingCourse({
      type,
      title: '',
      category: type === 'physical' ? '冬令營 / 實體活動' : '線上訂閱',
      price: type === 'physical' ? 8800 : 599,
      description: '',
      image: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=800',
      tags: defaultTags,
      duration: type === 'physical' ? '5 天全日營' : '每月 4 堂影音 + 生活實踐任務',
      location: type === 'physical' ? '台北市大安區教育中心' : '',
      details: '',
      startDate: '',
      endDate: ''
    });
    setTagInput(defaultTags.join(', '));
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse({ ...course });
    setTagInput(Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''));
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <BrandLogo iconSize={48} textColor="text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">後台管理系統登入</h2>
            <p className="text-slate-500 text-xs">請輸入管理員通行密碼進入後台管理設定</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">管理員密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="預設密碼：admin888"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              進入管理後台
            </button>
          </form>
        </div>
      </div>
    );
  }

  const physicalList = courses.filter(c => c.type === 'physical');
  const onlineList = courses.filter(c => c.type === 'online');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white animate-in slide-in-from-top duration-300 ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <BrandLogo iconSize={52} textColor="text-slate-900" />
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">後台控制中心</h1>
            <p className="text-slate-500 text-xs mt-0.5">管理首頁輪播圖、課程簡介 Banner，以及全站營隊與課程資料</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/download-zip"
            download="staredu-source.zip"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> 打包下載程式碼 (.zip)
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 border border-slate-200 rounded-lg hover:border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'banners'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> 橫幅圖片設置 (Banners)
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'physical'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 實體營隊管理 ({physicalList.length})
        </button>
        <button
          onClick={() => setActiveTab('online')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'online'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          <Tv className="w-4 h-4" /> 線上訂閱管理 ({onlineList.length})
        </button>
      </div>

      {/* Tab: Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-8">
          {/* Home Banners */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">首頁輪播橫幅 (Home Carousel Banners)</h3>
                <p className="text-xs text-slate-500 mt-0.5">可輸入一般圖片網址或 Google Drive 分享連結（系統會自動轉換為直連圖片）</p>
              </div>
              <button
                onClick={handleAddHomeBanner}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> 新增一張輪播圖
              </button>
            </div>

            <div className="space-y-4">
              {config.homeBanners.map((banner, idx) => (
                <div key={idx} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                      輪播圖 #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHomeBanner(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                      title="刪除這張輪播圖"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">刪除</span>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Preview Thumbnail */}
                    <div className="w-full md:w-36 aspect-21/9 md:aspect-video rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative">
                      {banner.image ? (
                        <img
                          src={formatImageUrl(banner.image)}
                          alt={`Banner preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x300?text=無效圖片網址';
                          }}
                        />
                      ) : (
                        <div className="text-[11px] text-slate-400 text-center px-2">尚未輸入圖片網址</div>
                      )}
                    </div>

                    {/* Inputs for Image URL and Goto Link */}
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>圖片網址 (Image URL)</span>
                        </label>
                        <input
                          type="text"
                          value={banner.image}
                          onChange={(e) => handleHomeBannerImageChange(idx, e.target.value)}
                          placeholder="請貼上圖片網址或 Google 雲端硬碟公開分享連結"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5 text-orange-600" />
                            <span>前往連結 (Goto Link)</span>
                            <span className="text-[11px] font-normal text-slate-400">（點擊 Banner 後跳轉目標，如非必填可留空）</span>
                          </span>
                          {banner.linkUrl && (
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                            >
                              <span>測試連結</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </label>
                        <input
                          type="text"
                          value={banner.linkUrl || ''}
                          onChange={(e) => handleHomeBannerLinkChange(idx, e.target.value)}
                          placeholder="例：/physical-courses 或 /online-courses 或外部連結 https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subpage Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">實體營隊頁面頂部橫幅 (Physical Banner)</h3>
              <div className="w-full aspect-21/9 rounded-xl bg-slate-100 overflow-hidden">
                <img
                  src={formatImageUrl(config.physicalBanner)}
                  alt="Physical banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x300?text=無效圖片網址';
                  }}
                />
              </div>
              <input
                type="text"
                value={config.physicalBanner}
                onChange={(e) => setConfig({ ...config, physicalBanner: e.target.value })}
                placeholder="請輸入實體營隊頁頂部 Banner 圖片網址"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              />
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">線上訂閱頁面頂部橫幅 (Online Banner)</h3>
              <div className="w-full aspect-21/9 rounded-xl bg-slate-100 overflow-hidden">
                <img
                  src={formatImageUrl(config.onlineBanner)}
                  alt="Online banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x300?text=無效圖片網址';
                  }}
                />
              </div>
              <input
                type="text"
                value={config.onlineBanner}
                onChange={(e) => setConfig({ ...config, onlineBanner: e.target.value })}
                placeholder="請輸入線上訂閱頁頂部 Banner 圖片網址"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSavingConfig ? '儲存中...' : '儲存所有橫幅設定'}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Physical Courses */}
      {activeTab === 'physical' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">實體營隊與常態課程清單</h3>
              <p className="text-xs text-slate-500 mt-0.5">點選右側按鈕新增實體營隊，可設定開課日期、上課地點與詳細說明</p>
            </div>
            <button
              onClick={() => openAddModal('physical')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> 新增實體營隊
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {physicalList.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-16/10 bg-slate-100">
                    <img
                      src={formatImageUrl(course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                      {course.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                    <div className="text-xs text-slate-400 space-y-0.5 pt-2 border-t border-slate-50">
                      {course.duration && <div>時數：{course.duration}</div>}
                      {course.location && <div>地點：{course.location}</div>}
                      {course.startDate && <div>開課：{course.startDate} ~ {course.endDate}</div>}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">NT$ {course.price.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除課程"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Online Courses */}
      {activeTab === 'online' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">線上月訂閱課程清單</h3>
              <p className="text-xs text-slate-500 mt-0.5">點選右側按鈕新增線上課程，可設定月訂閱費用與線上解鎖單元說明</p>
            </div>
            <button
              onClick={() => openAddModal('online')}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> 新增線上課程
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineList.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-16/10 bg-slate-100">
                    <img
                      src={formatImageUrl(course.image)}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-bold">
                      {course.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                    <div className="text-xs text-slate-400 space-y-0.5 pt-2 border-t border-slate-50">
                      {course.duration && <div>時數：{course.duration}</div>}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">NT$ {course.price.toLocaleString()} / 月</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="刪除課程"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / Create Course Modal */}
      {isModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                {editingCourse.id ? '編輯課程資料' : '新增課程'} ({editingCourse.type === 'physical' ? '實體營隊' : '線上訂閱'})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">課程標題 *</label>
                <input
                  type="text"
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="例：【寒假營隊】AI 小小程式設計師與機器人創客營"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">分類標籤 *</label>
                  <input
                    type="text"
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    placeholder="例：冬令營 / 實體活動 或 線上訂閱"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingCourse.type === 'physical' ? '費用 (NTD) *' : '月訂閱費 (NTD) *'}
                  </label>
                  <input
                    type="number"
                    value={editingCourse.price ?? 0}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">封面圖片網址 (支援 Google Drive 連結) *</label>
                <input
                  type="text"
                  value={editingCourse.image || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, image: e.target.value })}
                  placeholder="https://... 或 Google Drive 分享連結"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
                {editingCourse.image && (
                  <div className="mt-2 w-32 aspect-16/9 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={formatImageUrl(editingCourse.image)}
                      alt="預覽"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">簡介短評 *</label>
                <textarea
                  rows={2}
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  placeholder="簡短描述課程亮點，將呈現於卡片中..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">課程時數 / 週期</label>
                  <input
                    type="text"
                    value={editingCourse.duration || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    placeholder="例：5 天全日營 或 每月 4 堂影音"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">上課地點 (實體課程專用)</label>
                  <input
                    type="text"
                    value={editingCourse.location || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, location: e.target.value })}
                    placeholder="例：台北市大安區教育中心"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {editingCourse.type === 'physical' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">開課起始日期</label>
                    <input
                      type="date"
                      value={editingCourse.startDate || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">結課日期</label>
                    <input
                      type="date"
                      value={editingCourse.endDate || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">標籤 (以逗號分隔)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="例：理財啟蒙, 情境桌遊, 小學 1-6 年級"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">詳細課綱與介紹</label>
                <textarea
                  rows={4}
                  value={editingCourse.details || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, details: e.target.value })}
                  placeholder="輸入詳細的課程內容、每日流程、適合對象等..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourse}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSavingCourse ? '儲存中...' : '儲存課程'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
