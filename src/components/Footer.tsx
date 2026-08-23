import { Link } from 'react-router-dom';
import { Sparkles, Facebook, Instagram, Youtube, Download, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white leading-tight">星育有限公司</span>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">STAREDU EDUCATION</span>
              </div>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              引領孩子探索 AI 與數位創意的起點。我們透過遊戲化教學、實體創客營隊與高互動線上課程，啟發每個孩子的潛能與科技想像力。
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">快速連結</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">首頁</Link></li>
              <li><Link to="/physical-courses" className="hover:text-amber-400 transition-colors">實體營隊介紹</Link></li>
              <li><Link to="/online-courses" className="hover:text-amber-400 transition-colors">線上課程訂閱</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">後台管理</Link></li>
              <li>
                <a 
                  href="/api/download-zip" 
                  download="staredu-source.zip"
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center gap-1.5 mt-3"
                >
                  <Download className="h-4 w-4" /> 下載專案程式碼 (.zip)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">聯絡我們</h4>
            <ul className="space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@staredu.tw</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>02-2345-6789</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>台北市大安區教育科技創新園區</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} 星育有限公司 Staredu Education Co., Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">服務條款</a>
            <a href="#" className="hover:text-slate-400">隱私權政策</a>
            <a href="#" className="hover:text-slate-400">常見問題</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
