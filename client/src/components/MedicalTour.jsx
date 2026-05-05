import React, { useEffect, useRef, useState } from 'react';

// ==========================================
// CONFIGURACIÓN DE ESCENAS Y COORDENADAS
// Edita aquí para mover botones o cambiar imágenes
// ==========================================
const PANORAMAS_CONFIG = {
  puerta_principal: {
    title: 'Puerta 1: TRIAJE / EMERGENCIA',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 1 para entrar a triaje.emergencia.jpeg',
    hotSpots: [
      { pitch: -5.0, yaw: -42.0, type: 'scene', text: 'IR A TRIAJE / EMERGENCIA', sceneId: 'entrada_1_1', cssClass: 'professional-hotspot' },
      { pitch: -5.0, yaw: 15.0, type: 'scene', text: 'IR A LABORATORIO E IMAGEN', sceneId: 'laboratorio_1_2', cssClass: 'professional-hotspot' },
      { pitch: -6.80, yaw: -117.18, type: 'scene', text: 'ACCESO AMBULANCIAS', sceneId: 'puerta_2', cssClass: 'custom-hotspot-exit' },
      { pitch: -7.44, yaw: -156.99, type: 'scene', text: 'PUERTA 3', sceneId: 'puerta_3', cssClass: 'professional-hotspot' }

    ]
  },
  puerta_2: {
    title: 'PUERTA 2: ACCESO AMBULANCIAS',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 2.1.jpeg',
    hotSpots: [{ pitch: -12.23, yaw: 153.31, type: 'scene', text: 'Volver', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' }
    ]

  },
  laboratorio_1_2: {
    title: 'Puerta 1.2: LABORATORIO / IMAGENOLOGÍA',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 1.2 laboratorio. imagenes.jpeg',
    hotSpots: [{ pitch: 9.60, yaw: -54.19, type: 'scene', text: 'Volver a la Entrada', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' }]
  },
  entrada_1_1: {
    title: 'Interior: Triaje',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/Entrada 1.1 ENTRA A TRIAJE.jpeg',
    hotSpots: [{ pitch: -10, yaw: 180, type: 'scene', text: 'Volver a la Entrada', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' }]
  },
  puerta_3: {
    title: 'PUERTA 3: ADMISIÓN / FARMACIA / PIE DIABÉTICO / ENDOSCOPÍA',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/entrada puerta 3.jpeg',
    hotSpots: [{ pitch: -18.45, yaw: -97.06, type: 'scene', text: 'Entrar a Admisión / Farmacia', sceneId: 'puerta_3_1', cssClass: 'professional-hotspot' },
    { pitch: -24.07, yaw: 57.30, type: 'scene', text: 'Puerta 1', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' },
    { pitch: -24.07, yaw: 57.30, type: 'scene', text: 'Puerta 1', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' }
  ]
  },
  puerta_3_1: {
    title: 'Admisión / Farmacia',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/Puerta 3.1 está admisión. Farmacia emergencia. Farmacia consulta externa.jpeg',
    hotSpots: [
      { pitch: -10.0, yaw: 4.5, type: 'scene', text: 'Avanzar al pasillo', sceneId: 'puerta_3_2', cssClass: 'professional-hotspot' }
    ]
  },
  puerta_3_2: {
    title: 'Avanzar al pasillo ',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 3.2 Pasillo.jpeg',
    hotSpots: [
      { pitch: -10.53, yaw: -121.66, type: 'scene', text: 'Volver a Admisión', sceneId: 'puerta_3_1', cssClass: 'professional-hotspot' },
      { pitch: -6.66, yaw: 45.80, type: 'scene', text: 'Ir a Pie Diabético', sceneId: 'puerta_3_3', cssClass: 'professional-hotspot' },
    ]
  },
  puerta_3_3: {
    title: 'ÁREA DE PIE DIABÉTICO',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 3.3 U pie diabetico.jpeg',
    hotSpots: [
      { pitch: -30.21, yaw: 88.42, type: 'scene', text: 'Volver al Pasillo', sceneId: 'puerta_3_2', cssClass: 'professional-hotspot' },
      { pitch: -6.46, yaw: -134.93, type: 'scene', text: 'Ir a Endoscopía', sceneId: 'puerta_3_4', cssClass: 'professional-hotspot' }

    ]
  },
  puerta_3_4: {
    title: 'ÁREA DE ENDOSCOPÍA',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta 3.4 Endoscopia.jpeg',
    hotSpots: [{ pitch: 0.15, yaw: -149.35, type: 'scene', text: 'Volver al Pasillo de Pie Diabético', sceneId: 'puerta_3_3', cssClass: 'professional-hotspot' }]
  },
  puerta_4: {
    title: 'PUERTA 4: REHABILITACIÓN',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/entrada puerta 4.jpeg',
    hotSpots: [{ pitch: -3.54, yaw: -43.88, type: 'scene', text: 'Entrar a Puerta 4', sceneId: 'puerta_4_1', cssClass: 'professional-hotspot' },
    { pitch: 2.88, yaw: 59.82, type: 'scene', text: 'Puerta 3', sceneId: 'puerta_3', cssClass: 'professional-hotspot' }
    ]
  },
  puerta_4_1: {
    title: 'Pasillo 4.1',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/entrada de la puerta 4.1.jpeg',
    hotSpots: [
      { pitch: -10.27, yaw: -153.67, type: 'scene', text: 'Avanzar a Rehabilitación', sceneId: 'puerta_4_2', cssClass: 'professional-hotspot' },
      { pitch: -32.36, yaw: 123.66, type: 'scene', text: 'Regresar', sceneId: 'puerta_4', cssClass: 'professional-hotspot' }
    ]
  },
  puerta_4_2: {
    title: 'Pasillo 4.2',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/entrada de la puerta 4.2.jpeg',
    hotSpots: [
      { pitch: -8.86, yaw: -65.97, type: 'scene', text: 'Ir a Puerta de Rehabilitación', sceneId: 'puerta_4_3', cssClass: 'professional-hotspot' },
      { pitch: -10, yaw: 180, type: 'scene', text: 'Regresar', sceneId: 'puerta_4_1', cssClass: 'professional-hotspot' }
    ]
  },
  puerta_4_3: {
    title: 'ÁREA DE REHABILITACIÓN',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/Entrada 4.3 ÁREA DE REHABILITACIÓN.jpeg',
    hotSpots: [{ pitch: -23.84, yaw: 74.97, type: 'scene', text: 'Regresar', sceneId: 'puerta_4_2', cssClass: 'professional-hotspot' }]
  },
  oficinas_admin: {
    title: 'OFICINAS ADMINISTRATIVAS',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta oficina_administrativa 1.jpeg',
    hotSpots: [
      { pitch: -26.37, yaw: 48.51, type: 'scene', text: 'Volver a Puerta 1', sceneId: 'puerta_principal', cssClass: 'professional-hotspot' },
      { pitch: -20.44, yaw: -56.73, type: 'scene', text: 'Entrar a Oficina 1.1', sceneId: 'oficina_adm_1_1', cssClass: 'professional-hotspot' }
    ]
  },
  oficina_adm_1_1: {
    title: 'OFICINAS ADMINISTRATIVAS 1.1',
    type: 'equirectangular',
    panorama: '/recorrido-virtual/puerta oficina_administrativa 1.1.jpeg',
    hotSpots: [
      { pitch: -11.50, yaw: 83.00, type: 'scene', text: 'Volver', sceneId: 'oficinas_admin', cssClass: 'professional-hotspot' }
    ]
  }
};

const MedicalTour = () => {
  const viewerRef = useRef(null);
  const pannellumInstance = useRef(null);
  const audioRef = useRef(null);
  const [mostrarPortada, setMostrarPortada] = useState(true);
  const [titulo, setTitulo] = useState('Puerta 1');
  const [escenaActual, setEscenaActual] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [frameBot, setFrameBot] = useState(1);
  const fondoHospital = '/recorrido-virtual/fondo.hospital.jpg';

  const reproducirVoz = () => {
    if (audioRef.current && !isTalking) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.log("Esperando interacción"));
    }
  };

  /**
   * Listener para coordenadas en consola
   */
  useEffect(() => {
    const handleMapClick = (e) => {
      if (pannellumInstance.current && viewerRef.current && viewerRef.current.contains(e.target)) {
        try {
          const coords = pannellumInstance.current.mouseEventToCoords(e);
          if (coords) {
            console.log(`📍 Coordenadas clic - Pitch: ${coords[0].toFixed(2)}, Yaw: ${coords[1].toFixed(2)}`);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("mousedown", handleMapClick);
    return () => window.removeEventListener("mousedown", handleMapClick);
  }, []);

  // // Voz y animacion bot
  // useEffect(() => {
  //   audioRef.current = new Audio('/recorrido-virtual/VozELE.mpeg');
  //   const handlePlay = () => setIsTalking(true);
  //   const handleEnd = () => { setIsTalking(false); setFrameBot(1); };
  //   audioRef.current.addEventListener('play', handlePlay);
  //   audioRef.current.addEventListener('ended', handleEnd);
  //   audioRef.current.addEventListener('pause', handleEnd);
  //   return () => {
  //     if (audioRef.current) {
  //       audioRef.current.removeEventListener('play', handlePlay);
  //       audioRef.current.removeEventListener('ended', handleEnd);
  //       audioRef.current.removeEventListener('pause', handleEnd);
  //       audioRef.current.pause();
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   let interval;
  //   if (isTalking) {
  //     interval = setInterval(() => { setFrameBot(prev => (prev === 1 ? 2 : 1)); }, 300);
  //   } else {
  //     clearInterval(interval);
  //   }
  //   return () => clearInterval(interval);
  // }, [isTalking]);

  // Estilos Inyectados
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .professional-hotspot {
        width: 50px; height: 50px; background: rgba(0, 85, 165, 0.85); border: 3px solid #ffffff; border-radius: 50%;
        cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 15px rgba(0,0,0,0.5);
      }
      .professional-hotspot::after { content: '↑'; color: white; font-size: 24px; font-weight: bold; }
      .pnlm-hotspot-base span {
        display: block !important; visibility: visible !important; background: rgba(0, 85, 165, 0.9) !important;
        color: white !important; padding: 6px 12px !important; border-radius: 6px !important;
        font-family: 'Segoe UI', Arial, sans-serif !important; font-size: 13px !important; font-weight: 600 !important;
        text-align: center !important; width: auto !important; min-width: 100px !important; max-width: 180px !important;
        transform: translateX(-50%) !important; left: 50% !important; bottom: 58px !important;
        border: 1px solid rgba(255,255,255,0.4) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important; white-space: nowrap !important;
      }
      .pnlm-hotspot-base span::after {
        content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
        border-width: 6px; border-style: solid; border-color: rgba(0, 85, 165, 0.9) transparent transparent transparent;
      }
      .custom-hotspot-exit { height: 50px; width: 50px; background: rgba(220, 38, 38, 0.8); border: 2px solid white; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; }
      .custom-hotspot-exit::after { content: '🚑'; font-size: 24px; }
      .bot-talking-container { position: fixed; bottom: 10px; right: 10px; width: 100px; height: 100px; border-radius: 50%; background-color: #0055a5; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; overflow: hidden; border: 2px solid rgba(255,255,255,0.8); z-index: 1000; cursor: pointer; }
      .bot-talking-image { width: 100%; height: 100%; object-fit: contain; display: block; }
      @media (max-width: 600px) {
        .pnlm-hotspot-base span { font-size: 11px !important; min-width: 80px !important; padding: 4px 8px !important; bottom: 50px !important; }
        .interfaceWrapper { width: 95% !important; margin: 10px !important; }
        h1 { font-size: 22px !important; }
        .logoSection { padding: 15px 10px !important; gap: 10px !important; }
        h2 { font-size: 18px !important; }
      }
    `;
    document.head.appendChild(styleSheet);
    if (!window.pannellum) {
      const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(c); document.body.appendChild(s);
    }
    return () => { if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); };
  }, []);

  const iniciarTour = (id) => {
    setMostrarPortada(false);
    setEscenaActual(id);
    setTitulo(PANORAMAS_CONFIG[id]?.title || '');
    cargarVisor(id);
  };

  const cargarVisor = (id) => {
    setTimeout(() => {
      if (window.pannellum && viewerRef.current) {
        if (pannellumInstance.current) pannellumInstance.current.destroy();
        viewerRef.current.innerHTML = '';
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
          default: { firstScene: id, autoLoad: true, sceneFadeDuration: 1000, showControls: false, hfov: 110 },
          scenes: PANORAMAS_CONFIG
        });
      }
    }, 150);
  };

  // REFRESCAR AUTOMÁTICAMENTE SI CAMBIA LA CONFIGURACIÓN (HMR helper)
  useEffect(() => {
    if (!mostrarPortada && escenaActual) {
      cargarVisor(escenaActual);
    }
  }, [PANORAMAS_CONFIG]);

  const volverAlMenu = () => {
    if (pannellumInstance.current) {
      pannellumInstance.current.destroy();
      pannellumInstance.current = null;
    }
    setMostrarPortada(true);
  };

  const styles = {
    portadaContainer: { position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10, overflow: "hidden", backgroundColor: "#000" },
    backgroundLayer: { position: "absolute", inset: 0, backgroundImage: `url(${fondoHospital})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(8px)", zIndex: -1, transform: "scale(1.1)" },
    interfaceWrapper: { position: "relative", zIndex: 5, width: "90%", maxWidth: "800px", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(15px)", borderRadius: "30px", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", maxHeight: "85vh", overflow: "hidden", border: "1px solid rgba(255,255,255,0.3)" },
    header: { backgroundColor: "#0055a5", color: "white", padding: "25px", textAlign: "center", flexShrink: 0, fontFamily: "Arial, sans-serif" },
    logoSection: { padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", flexShrink: 0 },
    logoBox: { backgroundColor: "white", border: "4px solid #0055a5", borderRadius: "12px", padding: "8px 15px" },
    doorsSection: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", padding: "10px 30px 30px 30px", overflowY: "auto", flexGrow: 1 },
    btnCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', transition: '0.3s', position: 'relative', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' },
    iconNumber: { width: '40px', height: '40px', backgroundColor: '#0055a5', color: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold' },
    arrow: { position: 'absolute', right: '15px', color: '#0055a5', fontSize: '18px' }
  };

  if (mostrarPortada) {
    return (
      <div style={styles.portadaContainer}>
        <div style={styles.backgroundLayer}></div>
        <div style={styles.interfaceWrapper}>
          <div style={styles.header}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "1px" }}>RECORRIDO VIRTUAL</h1>
            <p style={{ margin: "5px 0 0 0", fontWeight: "600", opacity: 0.9, fontSize: "14px" }}>SELECCIONE UNA ENTRADA PARA COMENZAR</p>
          </div>
          <div style={styles.logoSection}>
            <div style={styles.logoBox}><div style={{ color: "#0055a5", fontSize: "30px" }}>✚</div></div>
            <div style={{ textAlign: "left" }}>
              <h2 style={{ margin: 0, color: "#003366", fontSize: "20px", fontWeight: "900" }}>HOSPITAL DR. VERDI</h2>
              <h2 style={{ margin: 0, color: "#003366", fontSize: "20px", fontWeight: "900" }}>CEVALLOS BALDA</h2>
            </div>
          </div>
          <div style={styles.doorsSection}>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_principal')}>
              <div style={styles.iconNumber}>1</div>
              <div><b style={{ fontSize: '18px', display: 'block', color: '#003366' }}>PUERTA 1</b><span style={{ fontSize: '12px', color: '#64748b' }}>Triaje / Emergencia / Lab</span></div>
              <span style={styles.arrow}>›</span>
            </button>
            <button style={{ ...styles.btnCard, border: '2px solid #dc2626' }} onClick={() => iniciarTour('puerta_2')}>
              <div style={{ ...styles.iconNumber, backgroundColor: '#dc2626' }}>2</div>
              <div><b style={{ fontSize: '18px', display: 'block', color: '#dc2626' }}>PUERTA 2 🚑</b><span style={{ fontSize: '12px', color: '#dc2626' }}>Acceso Ambulancias</span></div>
              <span style={{...styles.arrow, color: '#dc2626'}}>›</span>
            </button>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_3')}>
              <div style={styles.iconNumber}>3</div>
              <div><b style={{ fontSize: '18px', display: 'block', color: '#003366' }}>PUERTA 3</b><span style={{ fontSize: '12px', color: '#64748b' }}>Admisión / Farmacia / Pie Diabético</span></div>
              <span style={styles.arrow}>›</span>
            </button>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_4')}>
              <div style={styles.iconNumber}>4</div>
              <div><b style={{ fontSize: '18px', display: 'block', color: '#003366' }}>PUERTA 4</b><span style={{ fontSize: '12px', color: '#64748b' }}>Rehabilitación</span></div>
              <span style={styles.arrow}>›</span>
            </button>
            <button style={styles.btnCard} onClick={() => iniciarTour('oficinas_admin')}>
              <div style={{ ...styles.iconNumber, backgroundColor: '#003366' }}>🏢</div>
              <div><b style={{ fontSize: '18px', display: 'block', color: '#003366' }}>OFICINAS ADM.</b><span style={{ fontSize: '12px', color: '#64748b' }}>Av. Guayaquil</span></div>
              <span style={styles.arrow}>›</span>
            </button>
          </div>
        </div>
        {/* <div className="bot-talking-container" onClick={reproducirVoz}>
          <img src={frameBot === 1 ? '/recorrido-virtual/bot1.png' : '/recorrido-virtual/bot2.png'} alt="Asistente" className="bot-talking-image" />
        </div> */}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0,85,165,0.9)', color: 'white', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px' }}>{titulo}</div>
      <div ref={viewerRef} style={{ width: '100%', height: '100%', background: '#000' }}></div>
      <button onClick={volverAlMenu} style={{ position: 'absolute', bottom: '30px', left: '30px', zIndex: 110, padding: '12px 25px', cursor: 'pointer', borderRadius: '10px', border: 'none', background: 'white', fontWeight: 'bold', color: '#0055a5', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>⬅ VOLVER AL MENÚ</button>
    </div>
  );
};

export default MedicalTour;