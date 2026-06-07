import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
  const [status, setStatus] = useState(null); // null | 'ok' | 'error' | 'loading'
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/public/contacto', form);
      setStatus('ok');
      setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el mensaje. Intente nuevamente.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="text-primary-pale text-sm mb-4">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span>Contáctenos</span>
          </nav>
          <h1 className="text-4xl font-semibold font-heading">Contáctenos</h1>
          <p className="text-primary-pale mt-2">Estamos aquí para ayudarle. Envíennos su consulta.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold font-heading text-dark mb-6">Información de Contacto</h2>
            {[
              { Icon: MapPin, label: 'Dirección', content: 'Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105' },
              { Icon: Mail, label: 'Correo Electrónico', content: 'hospital.portoviejo@mspz4.gob.ec', href: 'mailto:hospital.portoviejo@mspz4.gob.ec' },
              { Icon: Clock, label: 'Atención al Público', content: 'Lunes a Viernes de 08h00 a 17h00\nEmergencias: 24h / 7 días' },
            ].map(({ Icon, label, content, href }) => (
              <div key={label} className="flex items-start gap-4 bg-white p-4 rounded-card shadow-sm">
                <div className="w-10 h-10 bg-primary-pale rounded-card flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs text-gray font-medium uppercase tracking-wide mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="text-sm text-dark hover:text-primary transition-colors font-medium">{content}</a>
                  ) : (
                    <p className="text-sm text-dark font-medium whitespace-pre-line">{content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-card shadow-card p-8">
              <h2 className="text-xl font-semibold font-heading text-dark mb-6">Enviar Mensaje</h2>

              {status === 'ok' ? (
                <div className="text-center py-10">
                  <CheckCircle size={48} className="mx-auto text-secondary mb-4" />
                  <h3 className="text-xl font-semibold text-dark mb-2">¡Mensaje enviado!</h3>
                  <p className="text-gray text-sm mb-6">Hemos recibido su consulta. Nos comunicaremos a la brevedad posible.</p>
                  <button onClick={() => setStatus(null)} className="btn-primario inline-flex">Enviar otro mensaje</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Nombre completo *</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej. Juan Pérez"
                        className="w-full border border-neutral-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Correo electrónico *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="correo@ejemplo.com"
                        className="w-full border border-neutral-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Teléfono (opcional)</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="0999 999 999"
                        className="w-full border border-neutral-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-dark mb-1">Asunto *</label>
                      <input name="asunto" value={form.asunto} onChange={handleChange} required placeholder="Motivo de consulta"
                        className="w-full border border-neutral-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dark mb-1">Mensaje *</label>
                    <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required rows={5} placeholder="Escriba su mensaje aquí..."
                      className="w-full border border-neutral-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-error bg-red-50 border border-red-200 rounded-btn p-3">
                      <AlertCircle size={15} /> {error}
                    </div>
                  )}

                  <button type="submit" disabled={status === 'loading'}
                    className="btn-primario w-full justify-center disabled:opacity-60">
                    {status === 'loading' ? 'Enviando...' : <><Send size={15} /> Enviar mensaje</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Mapa de Ubicación */}
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-card shadow-card p-2 h-[450px]">
         <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7978.275226332165!2d-80.447396024691!3d-1.0583940989314164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902b8d48b0e65edf%3A0x76ce313e65c9b749!2sHospital%20Regional%20Verdi%20Cevallos!5e0!3m2!1ses-419!2sec!4v1780422451002!5m2!1ses-419!2sec" className="w-full h-full" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </div>
  );
}
