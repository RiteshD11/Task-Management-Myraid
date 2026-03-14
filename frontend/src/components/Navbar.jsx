'use client';

import { useAuth } from '@/hooks/useAuth';
import { Zap, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <Zap size={14} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>TaskFlow</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'var(--bg-input)', borderRadius: 999, border: '1px solid var(--border)' }}>
          <User size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </nav>
  );
}
