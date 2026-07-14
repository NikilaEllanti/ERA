'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with React Flow
const CanvasWorkspace = dynamic(() => import('@/components/canvas/CanvasWorkspace'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#060810',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid rgba(79,142,247,0.3)',
        borderTopColor: '#4f8ef7',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span style={{color: '#94a3b8', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif'}}>
        Initializing ERA Canvas...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function CanvasPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const boardId = params.id as string;
  const templateId = searchParams.get('template') || 'blank';

  useEffect(() => {
    // Auth check
    const user = localStorage.getItem('era_user');
    if (!user) router.push('/');
  }, [router]);

  return <CanvasWorkspace boardId={boardId} templateId={templateId} />;
}
