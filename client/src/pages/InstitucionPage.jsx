import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Shield, Users, Award, Building2, Calendar, FileText, PhoneCall, Bed, TestTube, Cross, Activity, CheckCircle, Info } from 'lucide-react';
import heroBg from '../assets/background-hero-section.jpeg';
import logoMsp from '../assets/logo-msp-remove.png';
import escudoEcuador from '../assets/escudo-del-ecuador-nombre.jpg';

const valores = [
  { icon: Heart, title: 'Calidad y Calidez', desc: 'Atención centrada en el paciente con calidez humana y excelencia técnica.' },
  { icon: Shield, title: 'Ética y Transparencia', desc: 'Uso eficiente y transparente de los recursos públicos bajo principios bioéticos.' },
  { icon: Users, title: 'Equidad Social', desc: 'Salud accesible para toda la ciudadanía, sin distinción de ninguna clase.' },
  { icon: Award, title: 'Investigación y Docencia', desc: 'Formación continua del talento humano y avance del conocimiento médico.' },
];

export default function InstitucionPage() {
  return (
    <div className="min-h-screen bg-gray-light">

      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-[center_35%]"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 to-primary/90" />
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-semibold font-heading mb-4">Nuestra Institución</h1>
          <p className="text-lg md:text-xl text-primary-pale max-w-2xl mx-auto">
            Hospital Provincial Dr. Verdi Cevallos Balda: Comprometidos con la salud de Manabí y el Ecuador
          </p>
        </div>
      </div>

      {/* Reseña Histórica y Biografía */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold font-heading text-dark mb-4">Historia y Legado</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-10 text-gray leading-relaxed mb-12">
            {/* Historia del Hospital */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-pale rounded-xl flex items-center justify-center">
                  <Building2 className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-semibold text-dark font-heading">El Hospital</h3>
              </div>
              <p className="mb-4">
                El <strong>Hospital Provincial Dr. Verdi Cevallos Balda</strong>, ubicado en Portoviejo, es el principal referente de salud pública de la provincia de Manabí, Ecuador. Pertenece a la red del Ministerio de Salud Pública (MSP) y ofrece atención especializada, cirugías, banco de leche y servicios de apoyo terapéutico.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p><strong>Inicios (1884):</strong> Nace en diciembre de 1884 como un "hospital de sangre" debido a los conflictos bélicos de la época. En sus primeros años fue conocido también como "Hospital Militar" y "Hospital Civil".</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p><strong>Consolidación (1912):</strong> La institución pasó a manos de las Juntas de Beneficencia, marcando un hito en la administración de la salud local.</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p><strong>Evolución moderna:</strong> A lo largo de los años cambió de nombre varias veces hasta consolidarse como Hospital Regional Verdi Cevallos Balda. Tras ser un punto crítico durante el terremoto de 2016, la institución ha modernizado sus instalaciones y servicios, recuperando más de 20 especialidades médicas y subespecialidades.</p>
                </li>
              </ul>
            </div>

            {/* Biografía Dr. Verdi Cevallos */}
            <div className="bg-gradient-to-br from-primary to-primary-light p-8 rounded-3xl shadow-md text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Info className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-semibold font-heading">¿Quién fue el Dr. Verdi Cevallos Balda?</h3>
              </div>
              <p className="mb-4 text-primary-pale text-lg italic">
                "Verdi, el doctor del pueblo"
              </p>
              <p className="mb-4 text-white/90">
                Figura emblemática portovejense que dedicó más de 40 años a la salud pública. Dicen que sus grandes bolsillos de doctor siempre estaban llenos. De un lado cargaba canicas y del otro corviches, entregados como regalo a los niños de la escuela 18 de Octubre, que desde 1933 colinda con el hospital que hoy lleva su nombre.
              </p>
              <p className="mb-4 text-white/90">
                Brillante en la docencia, gran clínico, poeta, amante de la filosofía y de memoria enciclopédica. Sus pacientes no eran tratados como un número; los llamaba por su nombre. Se interesaba por sus afectos, preocupaciones y alegrías. Tierno, humano, sencillo.
              </p>
              <p className="mb-6 text-white/90">
                Escribía la historia clínica con letra gruesa, elaboraba diagnóstico y tratamiento justo. En sus últimos años caminaba encorvado, aún con sus canicas y corviches a la mano. Murió en 1991, no quiso ir a su casa; se quedó en el hospital, donde pasó sus últimos días rodeado de lo que consideraba un hogar.
              </p>
              <div className="mt-auto pt-4 border-t border-white/20 text-xs text-primary-pale flex justify-between items-center">
                <span>Nacido en Portoviejo (1908 - 1991)</span>
                <a href="https://www.facebook.com/share/p/1HNWSbbuGd/" target="_blank" rel="noopener noreferrer" className="hover:text-white underline transition-colors">
                  Fuente: Portoviejo La Capital
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cartera de Servicios */}
      <div className="bg-neutral-50 border-y border-neutral-200">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold font-heading text-dark mb-4">Cartera de Servicios Institucional</h2>
            <p className="text-gray max-w-2xl mx-auto text-lg">Capacidad resolutiva e infraestructura médica a su servicio.</p>
            <div className="w-20 h-1 bg-primary mx-auto mt-4" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[{
              titulo: "Consulta Externa y Emergencia",
              icono: <PhoneCall size={24} className="text-primary" />,
              items: [
                "Emergencia: 11 boxes de atención.",
                "Consulta Externa (42 consultorios): Múltiples especialidades médicas."
              ]
            }, {
              titulo: "Hospitalización y Cuidados",
              icono: <Bed size={24} className="text-primary" />,
              items: [
                "Hospitalización (200 camas).",
                "Terapia Intensiva (6 camas): 3 adultos y 3 pediátricas.",
                "Neonatología: 8 básicos, 7 intermedios, 5 intensivos."
              ]
            }, {
              titulo: "Servicios de Apoyo y Diagnóstico",
              icono: <TestTube size={24} className="text-primary" />,
              items: [
                "Servicios de apoyo: Laboratorio clínico Lac 2 (24 horas), Imagenología (24 horas).",
                "Servicios de Apoyo Terapéutico integrales."
              ]
            }, {
              titulo: "Centro Quirúrgico y Obstétrico",
              icono: <Cross size={24} className="text-primary" />,
              items: [
                "Centro Obstétrico: 2 salas de parto, 1 quirófano (para cesáreas).",
                "Centro Quirúrgico: 4 quirófanos operativos."
              ]
            }, {
              titulo: "Rehabilitación",
              icono: <Activity size={24} className="text-primary" />,
              items: [
                "Rehabilitación integral: Terapia física, respiratoria y de lenguaje."
              ]
            }].map((categoria) => (
              <div key={categoria.titulo} className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-primary-pale rounded-xl flex items-center justify-center shrink-0">
                    {categoria.icono}
                  </div>
                  <h3 className="font-semibold text-lg text-dark leading-tight">{categoria.titulo}</h3>
                </div>
                <ul className="space-y-3">
                  {categoria.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray">
                      <CheckCircle size={18} className="text-accent shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placa institucional (Misión y Visión) */}
      <section className="container mx-auto px-6 py-14">
        <div className="max-w-3xl mx-auto">

          {/* Tarjeta principal estilo placa */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-200">

            {/* Encabezado de la placa */}
            <div className="flex flex-col items-center py-10 px-8 border-b-4 border-primary">
              <p className="text-dark text-sm font-semibold tracking-widest uppercase mb-1">HOSPITAL</p>
              <h2 className="text-3xl md:text-4xl font-black text-primary font-heading text-center leading-tight mb-4">
                DR. VERDI CEVALLOS BALDA
              </h2>
              <div className="flex items-center gap-3">
                <img src={logoMsp} alt="Ministerio de Salud Pública" className="h-20 w-auto object-contain" />
              </div>
            </div>

            {/* Misión */}
            <div className="px-8 py-8 border-b border-neutral-100">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white px-8 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <Target size={16} />
                  <span className="font-bold text-base tracking-wide">Misión</span>
                </div>
              </div>
              <p className="text-dark text-center leading-relaxed text-base">
                Prestar servicios de salud con calidad y calidez en el ámbito de la asistencia
                especializada, a través de su cartera de servicios, cumpliendo con la responsabilidad
                de promoción, prevención, recuperación, rehabilitación de la salud integral, docencia
                e investigación, conforme a las políticas del Ministerio de Salud Pública y el trabajo
                en red, en el marco de la justicia y equidad social.
              </p>
            </div>

            {/* Visión */}
            <div className="px-8 py-8 border-b border-neutral-100 bg-neutral-50/60">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-white px-8 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <Eye size={16} />
                  <span className="font-bold text-base tracking-wide">Visión</span>
                </div>
              </div>
              <p className="text-dark text-center leading-relaxed text-base">
                Ser reconocidos por la ciudadanía como hospitales accesibles que prestan una atención
                de calidad que satisface las necesidades y expectativas de la población bajo principios
                fundamentales de la salud pública y bioética, utilizando la tecnología y los recursos
                públicos de forma eficiente y transparente.
              </p>
            </div>

            {/* Pie de la placa */}
            <div className="flex flex-col items-center py-8 px-8 bg-white">
              <p className="font-bold text-primary text-lg mb-4 tracking-wide">
                Ministerio de Salud Pública
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={escudoEcuador}
                  alt="Escudo del Ecuador"
                  className="h-32 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-gray font-semibold tracking-widest uppercase mt-3">
                REPÚBLICA DEL ECUADOR
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold font-heading text-dark mb-4">Nuestros Valores</h2>
            <p className="text-gray max-w-2xl mx-auto">Principios que guían cada acción de nuestro equipo de salud.</p>
            <div className="w-20 h-1 bg-primary mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor) => (
              <div
                key={valor.title}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-white border border-neutral-100 hover:border-primary/30 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-200">
                  <valor.icon size={28} className="text-primary group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-semibold text-dark mb-2 text-lg">{valor.title}</h3>
                <p className="text-sm text-gray leading-relaxed">{valor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary-light py-12">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-2xl font-semibold font-heading mb-3">Conozca más sobre nosotros</h2>
          <p className="text-primary-pale mb-6 max-w-2xl mx-auto">
            Explore nuestra documentación, noticias y servicios para conocer en detalle nuestra institucion.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/noticias" className="bg-white text-primary font-semibold px-6 py-2.5 rounded-btn hover:bg-neutral-50 transition-colors inline-flex items-center gap-2">
              <FileText size={18} /> Noticias
            </Link>
            <Link to="/documentos" className="bg-white text-primary font-semibold px-6 py-2.5 rounded-btn hover:bg-neutral-50 transition-colors inline-flex items-center gap-2">
              <Building2 size={18} /> Documentos
            </Link>
            <Link to="/contacto" className="bg-white text-primary font-semibold px-6 py-2.5 rounded-btn hover:bg-neutral-50 transition-colors inline-flex items-center gap-2">
              <Calendar size={18} /> Contacto
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
