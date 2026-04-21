import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image, FileText, Calendar as CalendarIcon, User } from 'lucide-react';
import api from '../api/axios';

export default function MedicoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ nombre: '', especialidadId: '', activo: true, telefono: '', email: '', bio: '' });
  const [foto, setFoto] = useState(null);
  const [cv, setCv] = useState(null);
  
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cargarEspecialidades = () => {
     api.get('/admin/especialidades').then(r => setEspecialidades(r.data.data));
  };
  
  const [mesActual, setMesActual] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [horarioManual, setHorarioManual] = useState({ lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', estado: 'DISPONIBLE' });
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  useEffect(() => {
    cargarEspecialidades();

    if (isEdit) {
      api.get('/admin/medicos').then(r => {
        const m = r.data.data.find(x => x.id === parseInt(id));
        if (m) setForm({ 
           nombre: m.nombre, 
           especialidadId: m.especialidadId || '', 
           activo: m.activo, 
           telefono: m.telefono || '', 
           email: m.email || '', 
           bio: m.bio || '' 
        });
      }).catch(() => navigate('/medicos'));
      
      cargarHorarioLocal(mesActual);
    }
  }, [id, mesActual]);

  const cargarHorarioLocal = async (mes) => {
    try {
      const res = await api.get(`/public/horarios/${mes}`);
      const hor = res.data.data.find(h => h.medicoId === parseInt(id));
      if (hor) {
         setHorarioManual({
            lunes: hor.lunes || '', martes: hor.martes || '', miercoles: hor.miercoles || '',
            jueves: hor.jueves || '', viernes: hor.viernes || '', estado: hor.estado
         });
      } else {
         setHorarioManual({ lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', estado: 'DISPONIBLE' });
      }
    } catch (error) {
       console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };
  
  const handleHorarioChange = (e) => {
     setHorarioManual({ ...horarioManual, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
         if (v !== null && v !== undefined) data.append(k, v);
      });
      if (foto) data.append('foto', foto);
      if (cv) data.append('cv', cv);

      if (isEdit) await api.put(`/admin/medicos/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/admin/medicos', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      navigate('/medicos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHorario = async () => {
     if (!isEdit) return alert('Debes guardar el médico primero.');
     setGuardandoHorario(true);
     try {
        await api.put(`/admin/medicos/${id}/horario`, { mes: mesActual, ...horarioManual });
        alert('Horario actualizado para ' + mesActual);
     } catch (error) {
        alert('Error al guardar el horario.');
     } finally {
        setGuardandoHorario(false);
     }
  };

  const handleAddEspecialidad = async () => {
     const nombre = window.prompt("Ingrese el nombre de la nueva especialidad:");
     if (!nombre || nombre.trim() === '') return;
     try {
       // El ícono es opcional por defecto para simplificar, usaremos 'User' o algo genérico
       await api.post('/admin/especialidades', { nombre: nombre.trim(), icono: 'Stethoscope' });
       cargarEspecialidades();
     } catch (err) {
       alert(err.response?.data?.message || 'Error al crear la especialidad');
     }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/medicos')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">{isEdit ? 'Editar Médico' : 'Nuevo Médico'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Modifica los datos del profesional.' : 'Ingresa la información para el directorio.'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold border-b border-gray-100 pb-2 mb-4">Información Personal</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                   <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Dr. Juan Pérez"
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad *</label>
                   <div className="flex gap-2">
                     <select name="especialidadId" value={form.especialidadId} onChange={handleChange} required
                       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition">
                       <option value="">Seleccione especialidad</option>
                       {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                     </select>
                     <button type="button" onClick={handleAddEspecialidad} className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition shrink-0" title="Añadir Especialidad">
                       +
                     </button>
                   </div>
                 </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                   <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="(05) 234-5678"
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
                   <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="medico@hpvc.gob.ec"
                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía / Perfil Profesional</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Breve descripción de su trayectoria..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none text-gray-600" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-5">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Foto / Avatar (JPG, PNG)</label>
                   <div className="border border-dashed border-gray-300 bg-gray-50 rounded-lg p-3 text-center flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden h-20">
                     <input type="file" accept="image/*" onChange={e => setFoto(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {foto ? (
                        <span className="text-secondary text-xs truncate max-w-full font-medium">{foto.name}</span>
                     ) : (
                        <><User size={20} className="text-gray-400" /><span className="text-xs text-gray-500">Subir foto (.jpg, .png)</span></>
                     )}
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Hoja de Vida (PDF)</label>
                   <div className="border border-dashed border-gray-300 bg-gray-50 rounded-lg p-3 text-center flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden h-20">
                     <input type="file" accept="application/pdf" onChange={e => setCv(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {cv ? (
                        <span className="text-secondary text-xs truncate max-w-full font-medium">{cv.name}</span>
                     ) : (
                        <><FileText size={20} className="text-gray-400" /><span className="text-xs text-gray-500">Subir CV (.pdf)</span></>
                     )}
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="activo" name="activo" checked={form.activo} onChange={handleChange}
                  className="w-4 h-4 accent-primary" />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">Médico activo en el directorio</label>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
                  <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Médico'}
                </button>
              </div>
            </form>
         </div>

         {/* Panel lateral: Horarios Manuales */}
         <div className="md:col-span-1">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6 ${!isEdit ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="flex items-center gap-2 mb-4 text-primary font-semibold border-b border-gray-100 pb-3">
                  <CalendarIcon size={18} />
                  <h3>Asignación de Horario</h3>
               </div>
               
               {!isEdit && <p className="text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded border border-gray-100">Guarda el médico primero para asignarle horarios manuales.</p>}

               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mes de configuración</label>
                    <input type="month" value={mesActual} onChange={e => setMesActual(e.target.value)}
                      className="w-full border border-gray-200 rounded text-sm px-2 py-1.5 focus:border-primary" />
                  </div>

                  <div className="space-y-2">
                     {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => (
                        <div key={dia} className="flex items-center gap-2">
                           <span className="w-8 text-xs font-semibold text-gray-500 uppercase">{dia.substring(0,3)}</span>
                           <input type="text" name={dia} value={horarioManual[dia]} onChange={handleHorarioChange} placeholder="ej. 08:00-12h00"
                             className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:border-primary transition" />
                        </div>
                     ))}
                  </div>

                  <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1 mt-2">Estado del mes</label>
                     <select name="estado" value={horarioManual.estado} onChange={handleHorarioChange}
                        className="w-full border border-gray-200 rounded text-sm px-2 py-1.5 focus:border-primary">
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="VACACIONES">VACACIONES</option>
                        <option value="SIN_ATENCION">SIN ATENCIÓN</option>
                     </select>
                  </div>

                  <button onClick={handleSaveHorario} disabled={guardandoHorario || !isEdit}
                     className="w-full py-2 bg-secondary text-white rounded text-sm font-medium hover:bg-secondary-light transition disabled:opacity-60 mt-4 shadow-sm">
                     {guardandoHorario ? 'Guardando...' : 'Guardar Horario Mensual'}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
