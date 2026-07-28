import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import PageTransition from '../ui/PageTransition';
import MessageShoutout from './MessageShoutout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const MESSAGE_POLL_INTERVAL_MS = 60_000;
const MESSAGE_MIN_REFRESH_MS = 45_000;
const MESSAGE_REQUEST_TIMEOUT_MS = 8_000;

const getLastNotifiedMessage = () => {
  try {
    return Number(sessionStorage.getItem('hpvc_last_notified_message') || 0);
  } catch {
    return 0;
  }
};

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [shoutout, setShoutout] = useState(null);
  const lastNotifiedRef = useRef(getLastNotifiedMessage());
  const summaryRequestRef = useRef(null);
  const lastSummaryAtRef = useRef(0);
  const canReadMessages = user?.rol === 'SUPERADMIN';

  const loadMessageSummary = useCallback(async ({ force = false } = {}) => {
    if (!canReadMessages) return;
    if (summaryRequestRef.current) return;
    if (!force && Date.now() - lastSummaryAtRef.current < MESSAGE_MIN_REFRESH_MS) return;

    const controller = new AbortController();
    summaryRequestRef.current = controller;

    try {
      const response = await api.get('/admin/contacto-resumen', {
        silent: true,
        signal: controller.signal,
        timeout: MESSAGE_REQUEST_TIMEOUT_MS,
      });
      const { totalNoLeidos = 0, recientes = [] } = response.data.data || {};
      const newest = recientes[0];

      lastSummaryAtRef.current = Date.now();
      setUnreadMessages(totalNoLeidos);

      if (newest && newest.id > lastNotifiedRef.current) {
        lastNotifiedRef.current = newest.id;
        setShoutout({ ...newest, totalNoLeidos });
        try {
          sessionStorage.setItem('hpvc_last_notified_message', String(newest.id));
        } catch {
          // El aviso sigue funcionando aunque el navegador bloquee el almacenamiento.
        }
      }
    } catch {
      // Un fallo de sondeo no debe interrumpir el trabajo administrativo.
    } finally {
      if (summaryRequestRef.current === controller) {
        summaryRequestRef.current = null;
      }
    }
  }, [canReadMessages]);

  useEffect(() => {
    if (!canReadMessages) return undefined;

    loadMessageSummary({ force: true });
    const refreshWhenActive = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        loadMessageSummary();
      }
    };
    const refreshAfterReconnect = () => loadMessageSummary({ force: true });
    const handleMessagesChanged = () => loadMessageSummary({ force: true });

    const interval = window.setInterval(refreshWhenActive, MESSAGE_POLL_INTERVAL_MS);
    const handleVisibility = () => {
      refreshWhenActive();
    };

    window.addEventListener('hpvc:messages-changed', handleMessagesChanged);
    window.addEventListener('online', refreshAfterReconnect);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('hpvc:messages-changed', handleMessagesChanged);
      window.removeEventListener('online', refreshAfterReconnect);
      document.removeEventListener('visibilitychange', handleVisibility);
      summaryRequestRef.current?.abort();
      summaryRequestRef.current = null;
    };
  }, [canReadMessages, loadMessageSummary]);

  useEffect(() => {
    if (!shoutout) return undefined;
    const timeout = window.setTimeout(() => setShoutout(null), 9_000);
    return () => window.clearTimeout(timeout);
  }, [shoutout]);

  return (
    <div className="admin-shell flex min-h-screen bg-[#f5f7f3]">
      <Sidebar unreadMessages={unreadMessages} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-4 sm:p-6 xl:p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <MessageShoutout message={shoutout} onClose={() => setShoutout(null)} />
    </div>
  );
}
