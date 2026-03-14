'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Zap } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Zap size={16} color="white" />
            </div>
            <span className="font-bold tracking-tight">TaskFlow</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
