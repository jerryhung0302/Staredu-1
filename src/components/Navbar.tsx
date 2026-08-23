import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MonitorPlay, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: '首頁', path: '/' },
    { name: '實體營隊 / 課程', path: '/physical-courses', icon: Users },
    { name: '線上訂閱課程', path: '/online-courses', icon: MonitorPlay },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group transition-transform hover:opacity-90 active:scale-98">
              <BrandLogo iconSize={56} textColor="text-slate-900" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive(link.path)
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
            <div className="pl-4">
              <Link
                to="/online-courses"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 transition-all hover:shadow-lg active:scale-95"
              >
                會員中心
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${
                  isActive(link.path)
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              to="/online-courses"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full px-5 py-3 rounded-xl text-base font-bold text-white bg-linear-to-r from-amber-500 to-orange-500 shadow-md shadow-orange-500/20"
            >
              會員中心
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
