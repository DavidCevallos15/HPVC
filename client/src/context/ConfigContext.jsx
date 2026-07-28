import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const ConfigContext = createContext({
  config: {},
  loading: true,
  sectionsLoading: true,
  secciones: [],
  isSectionEnabled: () => true,
  reloadConfig: () => {},
});

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({});
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  const fetchConfig = useCallback(() => {
    api.get('/public/configuracion', { silent: true })
      .then(res => setConfig(res.data.data || {}))
      .catch(err => console.error('Error al cargar configuración', err))
      .finally(() => setLoading(false));
  }, []);

  const fetchSections = useCallback(() => {
    api.get('/public/secciones-publicas', { silent: true })
      .then(res => setSecciones(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(err => {
        console.error('Error al cargar la disponibilidad de secciones', err);
        setSecciones([]);
      })
      .finally(() => setSectionsLoading(false));
  }, []);

  const reloadConfig = useCallback(() => {
    fetchConfig();
    fetchSections();
  }, [fetchConfig, fetchSections]);

  const isSectionEnabled = useCallback((clave) => {
    if (!clave) return true;
    const seccion = secciones.find(item => item.clave === clave);
    return seccion ? seccion.habilitada : true;
  }, [secciones]);

  useEffect(() => {
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    const onFocus = () => reloadConfig();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reloadConfig]);

  return (
    <ConfigContext.Provider value={{
      config,
      loading,
      sectionsLoading,
      secciones,
      isSectionEnabled,
      reloadConfig,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
