import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Compass, DollarSign,
  TrendingUp, Calendar, CheckSquare, X, Menu,
  Landmark, FileText, Trophy, Newspaper
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import storage from '../utils/storage';
import { cn } from '../utils/cn';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/explore', label: 'Explore & Chat', icon: Compass },
  { path: '/sop', label: 'SOP Generator', icon: FileText },
  { path: '/finance', label: 'Finance', icon: DollarSign },
  { path: '/loans', label: 'Loan Hub', icon: Landmark },
  { path: '/predictor', label: 'Predictor', icon: TrendingUp },
  { path: '/timeline', label: 'Timeline', icon: Calendar },
  { path: '/progress', label: 'Progress', icon: CheckSquare },
  { path: '/rewards', label: 'Rewards', icon: Trophy },
  { path: '/content', label: 'AI Insights', icon: Newspaper },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = storage.get('edupath_profile', {});
  const initials = profile.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'EP';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40 p-4">
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 flex flex-col shadow-lg relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/10 blur-[100px] pointer-events-none" />
          
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 10 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20"
              >
                <GraduationCap size={22} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">EduPath</h1>
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Premium AI</p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "text-gray-900 bg-teal-50 border border-teal-200" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-teal-100 to-transparent pointer-events-none"
                    />
                  )}
                  <Icon size={18} className={cn("transition-colors relative z-10", isActive ? "text-teal-600" : "group-hover:text-teal-500")} />
                  <span className="text-sm font-semibold relative z-10">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Card */}
          <div className="p-4 border-t border-gray-100">
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{profile.name || 'Student'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-tighter">Profile Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-4 left-4 right-4 z-50 bg-white rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">EduPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              {menuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 p-4 space-y-1.5 max-h-[70vh] overflow-y-auto"
            >
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link 
                    key={path} 
                    to={path} 
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                      isActive 
                        ? "text-gray-900 bg-teal-50 border border-teal-200" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-teal-600" : ""} />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
