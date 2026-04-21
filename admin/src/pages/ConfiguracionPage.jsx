import React, { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const CAMPOS = [
  { clave: 'hospital_nombre',    label: 'Nombre del Hospital',      type: 'text' },
  { clave: 'hospital_telefono',  label: 'Teléfono',                 type: 'text' },
  { clave: 'hospital_email',     label: 'Correo institucional',     type: 'email' },
  { clave: 'hospital_direccion', label: 'Dirección',                type: 'text' },
  { clave: 'hospital_horario',   label: 'Horario de atención',      type: 'textarea' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/configuracion').then(r => setConfig(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (clave, value) => setConfig(c => ({ ...c, [clave]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/configuracion', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Parámetros institucionales que aparecen en el sitio web público.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {CAMPOS.map(({ clave, label, type }) => (
            <div key={clave}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea value={config[clave] || ''} onChange={e => handleChange(clave, e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none" />
              ) : (
                <input type={type} value={config[clave] || ''} onChange={e => handleChange(clave, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
              )}
            </div>
          ))}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle size={15} /> Configuración guardada exitosamente.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
              <Save size={15} /> {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
