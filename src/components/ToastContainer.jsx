'use client';

import { useToastState } from '@/context/ToastContext';

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

const STYLES = {
  success: { bar: '#22c55e', bg: '#052e16', border: '#166534', text: '#4ade80' },
  error:   { bar: '#ef4444', bg: '#2d0a0a', border: '#7f1d1d', text: '#f87171' },
  warning: { bar: '#f59e0b', bg: '#2d1a02', border: '#78350f', text: '#fbbf24' },
  info:    { bar: '#FF9980', bg: '#1e1a17', border: '#7c4a36', text: '#FF9980' },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToastState();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const s = STYLES[toast.type] || STYLES.info;
        return (
          <div
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              backgroundColor: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: '14px',
              padding: '14px 16px',
              minWidth: '280px',
              maxWidth: '360px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              opacity: toast.exiting ? 0 : 1,
              transform: toast.exiting ? 'translateX(20px)' : 'translateX(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Barra de color izquierda */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: s.bar,
              borderRadius: '14px 0 0 14px',
            }} />

            {/* Icono */}
            <div style={{ color: s.text, marginLeft: '8px', flexShrink: 0, paddingTop: '1px' }}>
              {ICONS[toast.type] || ICONS.info}
            </div>

            {/* Mensaje */}
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: '#e2e8f0',
              lineHeight: '1.5',
              flexGrow: 1,
            }}>
              {toast.message}
            </p>

            {/* Boton cerrar */}
            <div style={{ color: '#64748b', flexShrink: 0, paddingTop: '1px', fontSize: '16px', lineHeight: 1 }}>
              ×
            </div>
          </div>
        );
      })}
    </div>
  );
}
