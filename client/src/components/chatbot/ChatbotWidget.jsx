import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, ChevronRight, Bot } from 'lucide-react';
import posthog from 'posthog-js';

// ─── Árbol de conversación ────────────────────────────────────────────────────
const CHATBOT_TREE = {
  inicio: {
    text: '¡Hola! 👋 Soy el Asistente Virtual del **Hospital Provincial Dr. Verdi Cevallos Balda**. ¿En qué le puedo ayudar hoy?',
    opciones: [
      { label: '📅 Citas y consulta de citas',   next: 'citas' },
      { label: '🕐 Horarios de atención',        next: 'horarios' },
      { label: '🏥 Especialidades médicas',      next: 'especialidades' },
      { label: '🔬 Resultados de laboratorio',   next: 'laboratorio' },
      { label: '🚨 Emergencias',                 next: 'emergencias' },
      { label: '📍 Dirección y ubicación',       next: 'ubicacion' },
      { label: '📞 Información de contacto',     next: 'contacto' },
      { label: '📄 Documentos y trámites',       next: 'documentos' },
      { label: '🔗 Accesos y plataformas',       next: 'accesos' },
    ],
  },

  citas: {
    text: '📅 **Citas Médicas y Consulta Externa**\n\nPuede consultar su cita en el portal HPVC de manera digital.\n\nTambién puede acercarse presencialmente a ventanilla de admisión para mayor información.',
    opciones: [
      { label: '🌐 Consultar mi cita en línea',    href: 'http://186.47.77.45:8082/consulta_cita/', extBlank: true },
      { label: '👨‍⚕️ Ver Directorio Médico',            link: '/directorio' },
      { label: '🏥 Ver Especialidades',                link: '/especialidades' },
      { label: '🔙 Volver al inicio',                  next: 'inicio' },
    ],
  },

  horarios: {
    text: '🕐 **Horarios de Atención**\n\n• **Emergencias:** 24 horas, todos los días del año.\n• **Consulta Externa:** Lunes a Viernes de 08h00 a 17h00.\n• **Laboratorio Clínico:** Lunes a Viernes de 07h00 a 16h00.\n• **Imagen / Radiología:** Lunes a Viernes de 08h00 a 16h00.\n• **Farmacia:** Lunes a Viernes de 07h30 a 17h00.',
    opciones: [
      { label: '📅 Agendar una cita',        next: 'citas' },
      { label: '👨‍⚕️ Ver Directorio Médico',  link: '/directorio' },
      { label: '🔙 Volver al inicio',         next: 'inicio' },
    ],
  },

  especialidades: {
    text: '🏥 **Especialidades Médicas y Áreas**\n\nActualmente contamos con más de **50 especialidades médicas y áreas institucionales** (Pediatría, Cirugía, UCI, Ginecología, Farmacia, Admisiones, etc.) y un directorio con **más de 140 profesionales médicos y personal de salud** a su servicio.\n\nLe invitamos a consultar nuestro Directorio Médico digital para ver todo el listado oficial y buscar a su especialista.',
    opciones: [
      { label: '🏥 Ver todas las áreas',          link: '/especialidades' },
      { label: '👨‍⚕️ Ver Directorio (140+ médicos)', link: '/directorio' },
      { label: '📅 Agendar una cita',             next: 'citas' },
      { label: '🔙 Volver al inicio',              next: 'inicio' },
    ],
  },

  laboratorio: {
    text: '🔬 **Resultados de Laboratorio**\n\nPuede consultar sus exámenes en línea ingresando su número de cédula en el portal institucional.\n\nTambién puede retirar los resultados físicamente en la ventanilla del laboratorio en horario de atención.',
    opciones: [
      { label: '🌐 Portal de Resultados HPVC',   href: 'http://186.47.77.45:8081/hpvc/', extBlank: true },
      { label: '🕐 Ver horarios de laboratorio', next: 'horarios' },
      { label: '🔙 Volver al inicio',             next: 'inicio' },
    ],
  },

  emergencias: {
    text: '🚨 **EMERGENCIAS — Atención 24/7**\n\nNuestro servicio de emergencias atiende de forma **ininterrumpida** todos los días del año.\n\n📱 **ECU 911** para emergencias vitales\n\n📍 Calle 12 de Marzo y Rocafuerte, Portoviejo.',
    opciones: [
      { label: '📞 Llamar al ECU 911',          href: 'tel:911' },
      { label: '📍 Ver ubicación del hospital',  next: 'ubicacion' },
      { label: '🔙 Volver al inicio',            next: 'inicio' },
    ],
  },

  ubicacion: {
    text: '📍 **Ubicación del Hospital**\n\n**Calle 12 de Marzo y Rocafuerte**\nPortoviejo, Ecuador, 130105\n\nDisponemos de área de estacionamiento. Puede llegar a través de transporte público o vehículo propio.',
    opciones: [
      { label: '🗺️ Abrir en Google Maps', href: 'https://maps.google.com/?q=Calle+12+de+Marzo+y+Rocafuerte+Portoviejo+Ecuador', extBlank: true },
      { label: '🚨 Emergencias 24/7',      next: 'emergencias' },
      { label: '🔙 Volver al inicio',      next: 'inicio' },
    ],
  },

  contacto: {
    text: '📞 **Información de Contacto**\n\n• **Correo:** hospital.portoviejo@mspz4.gob.ec\n• **Dirección:** Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador, 130105\n\nTambién puede enviarnos un mensaje a través del formulario de contacto de nuestro portal.',
    opciones: [
      { label: '✉️ Enviar correo electrónico',          href: 'mailto:hospital.portoviejo@mspz4.gob.ec' },
      { label: '📝 Formulario de contacto',        link: '/contacto' },
      { label: '🔙 Volver al inicio',              next: 'inicio' },
    ],
  },

  documentos: {
    text: '📄 **Documentos y Trámites**\n\nEn nuestro portal de documentos puede descargar formularios, resoluciones, planes institucionales, informes de rendición de cuentas y más.',
    opciones: [
      { label: '📄 Ir a Documentos / Transparencia', link: '/documentos' },
      { label: '🔗 Accesos a plataformas MSP',       link: '/accesos' },
      { label: '🔙 Volver al inicio',                next: 'inicio' },
    ],
  },

  accesos: {
    text: '🔗 **Accesos Directos y Plataformas**\n\nDesde el portal de accesos puede ingresar a:\n\n• Sistemas del MSP (RDACAA, BIONE, QUIPUX...)\n• Plataformas internas zonales\n• Portales y trámites del Estado',
    opciones: [
      { label: '🔗 Ver todos los accesos',            link: '/accesos' },
      { label: '🔬 Portal de Resultados Laboratorio', href: 'http://186.47.77.45:8081/hpvc/', extBlank: true },
      { label: '🏛️ Portal del Ministerio de Salud',  href: 'https://www.salud.gob.ec', extBlank: true },
      { label: '🔙 Volver al inicio',                 next: 'inicio' },
    ],
  },
};

// ─── Renderizador de texto con negritas ───────────────────────────────────────
function parseText(text) {
  return text.split('\n').map((line, i) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <p
        key={i}
        className="mb-0.5 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const [open, setOpen]     = useState(false);
  const [history, setHistory] = useState([]);
  const [node, setNode]     = useState('inicio');
  const messagesEnd         = useRef(null);
  const navigate            = useNavigate();

  // Mensaje de bienvenida al abrir
  useEffect(() => {
    if (open && history.length === 0) {
      setHistory([{ type: 'bot', text: CHATBOT_TREE.inicio.text }]);
    }
  }, [open]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleOption = (opt) => {
    // Agrega mensaje del usuario
    setHistory((h) => [...h, { type: 'user', text: opt.label }]);
    posthog.capture('chatbot_option_selected', { option_label: opt.label, current_node: node });

    if (opt.href) {
      // Enlace externo o tel:
      if (opt.extBlank) {
        posthog.capture('chatbot_external_link_clicked', { option_label: opt.label, current_node: node });
        window.open(opt.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = opt.href;
        return;
      }
      setTimeout(() => {
        setHistory((h) => [
          ...h,
          { type: 'bot', text: '¡Le abrí el enlace! ¿Hay algo más en lo que pueda ayudarle?' },
        ]);
        setNode('inicio');
      }, 300);
    } else if (opt.link) {
      // Navegación interna con React Router
      navigate(opt.link);
      setOpen(false);
    } else if (opt.next && CHATBOT_TREE[opt.next]) {
      const next = CHATBOT_TREE[opt.next];
      setTimeout(() => {
        setHistory((h) => [...h, { type: 'bot', text: next.text }]);
        setNode(opt.next);
      }, 280);
    }
  };

  const handleReset = () => {
    setHistory([{ type: 'bot', text: CHATBOT_TREE.inicio.text }]);
    setNode('inicio');
  };

  const currentNode = CHATBOT_TREE[node];

  return (
    <>
      {/* ── Panel del chat ── */}
      <div
        className={`fixed bottom-24 right-5 z-[9998] w-[340px] max-h-[560px] flex flex-col bg-white rounded-card shadow-floating border border-neutral-100 transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-primary text-white px-4 py-3 rounded-t-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">Asistente HPVC</div>
              <div className="flex items-center gap-1.5 text-xs text-primary-pale mt-0.5">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                En línea · Hospital Verdi Cevallos
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Reiniciar conversación"
              className="p-1.5 hover:bg-white/20 rounded transition-colors text-xs text-primary-pale hover:text-white"
            >
              ↺
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2.5 rounded-card text-sm ${
                  msg.type === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-neutral-50 text-dark rounded-bl-sm border border-neutral-100'
                }`}
              >
                {parseText(msg.text)}
              </div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        {/* Opciones */}
        <div className="p-3 border-t border-neutral-100 space-y-1.5 max-h-48 overflow-y-auto shrink-0 bg-neutral-50/50 rounded-b-card">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2 px-1">Seleccione una opción</p>
          {currentNode?.opciones?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOption(opt)}
              className="w-full text-left text-xs px-3 py-2 rounded-btn bg-white hover:bg-primary-pale hover:text-primary border border-neutral-200 hover:border-primary/30 transition-all duration-150 flex items-center justify-between gap-2 group"
            >
              <span className="leading-snug">{opt.label}</span>
              <ChevronRight size={11} className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Botón flotante (FAB) ── */}
      <button
        onClick={() => {
          if (!open) posthog.capture('chatbot_opened');
          setOpen(!open);
        }}
        aria-label="Abrir asistente virtual"
        className="fixed bottom-5 right-5 z-[9999] w-16 h-16 bg-primary hover:bg-primary-light text-white rounded-full shadow-floating flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {open ? <X size={30} /> : <MessageCircle size={30} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[9px] font-bold text-primary-dark flex items-center justify-center animate-pulse">
            ?
          </span>
        )}
      </button>
    </>
  );
}
