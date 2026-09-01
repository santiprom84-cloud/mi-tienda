'use client';

import { useEffect } from 'react';

// Genera o recupera un ID único para este dispositivo/navegador
function getOrCreateSessionId() {
  try {
    const KEY = 'polirubro_sid';
    let sid = localStorage.getItem(KEY);
    if (!sid) {
      // Genera un UUID v4 simple sin dependencias
      sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
      localStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    // Si localStorage no está disponible (modo privado extremo, etc.)
    return null;
  }
}

export default function VisitTracker() {
  useEffect(() => {
    const sid = getOrCreateSessionId();
    if (!sid) return;

    // Registramos la visita de hoy (el upsert del servidor evita duplicados)
    fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sid }),
    }).catch(() => {
      // Silencioso: si falla el tracking no molestamos al usuario
    });
  }, []); // Solo se ejecuta una vez al montar (= una vez por carga de página)

  return null; // Componente invisible
}
