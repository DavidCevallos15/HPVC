import React from 'react';
import {
  FileText, BookOpen, Users, IdCard, List, Pill,
  Monitor, Archive, Mail, Cloud, HardDrive, Folder,
  Globe, MessageCircle, Landmark, ExternalLink, Calendar,
  Form,
  User
} from 'lucide-react';
import posthog from 'posthog-js';

const categorias = [
  {
    titulo: "Plataformas Hospital Verdi Cevallos",
    color: "secondary",
    enlaces: [
      { nombre: "Correo Zimbra", url: "https://mail.hpvc.gob.ec/", Icono: Mail },
      { nombre: "Drive Zonal", url: "https://nube.mspz4.gob.ec/login", Icono: HardDrive },
      { nombre: "Drive 13d01 MSP", url: "https://app.13d01.mspz4.gob.ec/", Icono: Folder },
      { nombre: "Consulta de Citas Verdi", url: "http://186.47.77.45:8082/consulta_cita/", Icono: Calendar },
      { nombre: "Sistema de Información Hospitalaria", url: "http://186.47.77.45:8082/syshpvc/", Icono: Monitor },
    ]
  },
  {
    titulo: "Sistemas Nacionales (MSP)",
    color: "primary", // Estilos basados en el color primario
    enlaces: [
      { nombre: "Quipux", url: "https://mail.hpvc.gob.ec/", Icono: FileText },
      { nombre: "PahoFlu", url: "https://sive.msp.gob.ec/Account/Login?ReturnUrl=%2F", Icono: BookOpen },
      { nombre: "Agendamiento MSP", url: "https://agendamiento.msp.gob.ec/login", Icono: Users },
      { nombre: "PRAS", url: "https://sgrdacaa.msp.gob.ec/", Icono: IdCard },
      { nombre: "Apps MSP", url: "https://app.13d01.mspz4.gob.ec/", Icono: List },
    ]
  },
  
  {
    titulo: "Portales y Trámites del Estado",
    color: "accent",
    enlaces: [
      { nombre: "Portal Trámites", url: "https://www.gob.ec/", Icono: Globe },
      { nombre: "Contacto Ciudadano", url: "https://www.contactociudadano.gob.ec/", Icono: MessageCircle },
      { nombre: "SNI Público", url: "https://sni.msp.gob.ec/app/home/", Icono: Landmark },
    ]
  }
];

export default function AccesosPage() {
  return (
    <div className="bg-neutral-50 min-h-screen py-10">
      <div className="container mx-auto px-6">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl font-semibold font-heading text-primary mb-4">
            Accesos Directos
          </h1>
          <p className="text-gray text-lg">
            Plataformas institucionales, sistemas zonales y servicios digitales del Estado a su disposición.
          </p>
        </div>

        {/* Contenedor de Categorías */}
        <div className="space-y-12">
          {categorias.map((categoria, idx) => (
            <section key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
              <h2 className="text-2xl font-semibold font-heading text-dark mb-6 flex items-center gap-2 border-b border-neutral-200 pb-3">
                <span className={`block w-2 h-6 rounded-full bg-${categoria.color} mr-2`} />
                {categoria.titulo}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoria.enlaces.map((enlace, index) => {
                  const Icono = enlace.Icono;
                  return (
                    <a
                      key={index}
                      href={enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => posthog.capture('external_access_clicked', { platform_name: enlace.nombre, category: categoria.titulo })}
                      className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-md border border-neutral-100 hover:border-primary/20 transition-all duration-300 flex items-center justify-between pointer-events-auto hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-${categoria.color}-pale text-${categoria.color} flex items-center justify-center transition-colors group-hover:bg-${categoria.color} group-hover:text-white`}>
                          <Icono size={24} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-dark group-hover:text-primary transition-colors">
                            {enlace.nombre}
                          </span>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-neutral-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0" />
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        
      </div>
    </div>
  );
}
