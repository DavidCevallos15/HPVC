import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const ConfigContext = createContext({ config: {}, loading: true });

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/configuracion')
      .then(res => setConfig(res.data.data))
      .catch(err => console.error('Error al cargar configuración', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => useContext(ConfigContext);
