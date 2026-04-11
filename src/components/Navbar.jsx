import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Compass, DollarSign,
  TrendingUp, Calendar, CheckSquare, X, Menu,
  Landmark, FileText, Trophy, Newspaper
} from 'lucide-react';
import { useState } from 'react';
import storage from '../utils/storage';

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
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-surface border-r border-surface-border fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-5 border-b border-surface-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">EduPath</h1>
              <p className="text-xs text-muted">Study Abroad AI</p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={location.pathname === path ? 'nav-link-active' : 'nav-link'}
            >
              <Icon size={16} />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-surface-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-card">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.name || 'Student'}</p>
              <p className="text-xs text-muted truncate">{profile.targetCourse || 'No course selected'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-surface-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-white">EduPath</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-surface-card transition-colors">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-surface-border bg-surface p-3 space-y-0.5 animate-fade-in max-h-[70vh] overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                className={location.pathname === path ? 'nav-link-active' : 'nav-link'}>
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
