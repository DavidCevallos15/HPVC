import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ConfigContext = createContext({ config: {}, loading: true, reloadConfig: () => {} });

export function ConfigProvider({ children }) {
  const [config, setConfig]   = useState({});
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(() => {
    api.get('/public/configuracion', { silent: true })
      .then(res => setConfig(res.data.data || {}))
      .catch(err => console.error('Error al cargar configuración', err))
      .finally(() => setLoading(false));
  }, []);

  // Carga inicial
  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // Recarga cuando la pestaña del cliente vuelve a estar visible
  // (útil cuando el admin guarda y el usuario vuelve al cliente)
  useEffect(() => {
    const onFocus = () => fetchConfig();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchConfig]);

  return (
    <ConfigContext.Provider value={{ config, loading, reloadConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
