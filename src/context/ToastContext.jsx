'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => {
      const next = [...prev, { id, message, type, exiting: false }];
      return next.slice(-3); // Maximo 3 toasts simultaneos
    });
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error:   (msg, duration) => addToast(msg, 'error', duration),
    info:    (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, dismiss, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx.toast;
}

export function useToastState() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastState debe usarse dentro de <ToastProvider>');
  return { toasts: ctx.toasts, dismiss: ctx.dismiss };
}
