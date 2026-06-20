'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, AdminUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { LayoutDashboard, Users, Map, LogOut, Loader2, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockWarning, setMockWarning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If we're on the login page, don't protect it
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      const activeUser = await auth.getUser();
      if (!activeUser) {
        router.push('/admin/login');
      } else {
        setUser(activeUser);
        setMockWarning(db.isMockMode());
      }
      setLoading(false);
    }
    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  // If on login, just show the login screen itself
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#D55D27]" size={36} />
        <span className="text-xs font-medium text-[#45471D] uppercase tracking-widest font-display">
          Loading Nomichi Desk...
        </span>
      </div>
    );
  }

  // If auth check completes and user doesn't exist, we'll redirect, but return blank during transition
  if (!user) {
    return null;
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/leads', label: 'Leads CRM', icon: Users },
    { href: '/admin/trips', label: 'Trips CMS', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col md:flex-row text-[#1C1B1A]">
      
      {/* Sidebar for Desktop / Header for Mobile */}
      <header className="md:hidden border-b border-[rgba(209,183,136,0.3)] bg-[#FFFBF5] px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex flex-col">
          <img 
            src="/logo.png" 
            alt="Nomichi Logo" 
            className="h-7 w-auto object-contain mb-0.5 align-middle self-start mix-blend-multiply" 
          />
          <span className="text-[9px] uppercase tracking-widest text-[#45471D] font-semibold">Trip Desk</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#1C1B1A] hover:text-[#D55D27] focus:outline-none"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-white border-b border-[rgba(209,183,136,0.3)] z-10 p-6 space-y-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    active 
                      ? 'bg-[rgba(213,93,39,0.1)] text-[#D55D27] font-semibold' 
                      : 'hover:bg-[#FFFBF5] text-[#45471D]'
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="px-4 text-xs text-gray-500">
              Logged in as <strong className="text-[#1C1B1A]">{user.full_name}</strong>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-[rgba(209,183,136,0.3)] flex-col sticky top-0 h-screen shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-[rgba(209,183,136,0.15)] flex flex-col">
          <img 
            src="/logo.png" 
            alt="Nomichi Logo" 
            className="h-8 w-auto object-contain mb-1 self-start mix-blend-multiply" 
          />
          <span className="text-[10px] uppercase tracking-widest text-[#45471D] font-semibold mt-0.5">
            Trip Desk CRM
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-[rgba(213,93,39,0.08)] text-[#D55D27] font-semibold border-l-4 border-[#D55D27] rounded-l-none' 
                    : 'text-[#45471D] hover:bg-[#FFFBF5] hover:text-[#1C1B1A]'
                }`}
              >
                <link.icon size={18} className={active ? 'text-[#D55D27]' : 'text-[#D1B788]'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile / Logout */}
        <div className="p-4 border-t border-[rgba(209,183,136,0.15)] bg-[#FFFBF5] space-y-3">
          <div className="px-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block">Signed In Host</span>
            <span className="text-xs font-semibold text-[#1C1B1A] truncate block mt-0.5">{user.full_name}</span>
            <span className="text-[10px] text-gray-400 truncate block">{user.email}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
