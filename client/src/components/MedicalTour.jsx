import React, { useEffect, useRef, useState } from 'react';

const MedicalTour = () => {
  const viewerRef = useRef(null);
  const pannellumInstance = useRef(null);
  const audioRef = useRef(null); 
  const [mostrarPortada, setMostrarPortada] = useState(true);
  const [titulo, setTitulo] = useState('Puerta 1');
  
  const [isTalking, setIsTalking] = useState(false); 
  const [frameBot, setFrameBot] = useState(1); 

  const basePath = '/recorrido-virtual';
  const fondoHospital = `${basePath}/fondo.hospital.jpg`;

  const reproducirVoz = () => {
    if (audioRef.current && !isTalking) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.log("Esperando interacción para audio"));
    }
  };

  useEffect(() => {
    audioRef.current = new Audio(`${basePath}/VozELE.mpeg`);

    const handlePlay = () => setIsTalking(true);
    const handleEnd = () => {
      setIsTalking(false);
      setFrameBot(1);
    };

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('ended', handleEnd);
    audioRef.current.addEventListener('pause', handleEnd);

    const timerVoz = setTimeout(() => {
      reproducirVoz();
    }, 1000); 

    return () => {
      clearTimeout(timerVoz);
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('ended', handleEnd);
        audioRef.current.removeEventListener('pause', handleEnd);
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isTalking) {
      interval = setInterval(() => {
        setFrameBot(prev => (prev === 1 ? 2 : 1));
      }, 300);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTalking]);

  const panoramas = {
    puerta_principal: {
      title: 'Puerta 1: TRIAJE / EMERGENCIA',
      type: 'equirectangular',
      panorama: `${basePath}/LISTA_puerta 1 para entrar a triaje.emergencia.jpeg`,
      hotSpots: [
        { pitch: -2.637722287476477, yaw: -54.124482496954805, type: 'scene', text: 'A TRIAJE / EMERGENCIA', sceneId: 'entrada_1_1', cssClass: 'custom-hotspot-navigation' },
        { pitch: -8, yaw: 15, type: 'scene', text: 'LABORATORIO E IMAGEN', sceneId: 'laboratorio_1_2', cssClass: 'custom-hotspot-navigation' },
        { pitch: 5.22, yaw: -133.28, type: 'info', text: 'SALIDA AMBULANCIAS', cssClass: 'custom-hotspot-exit' }
      ]
    },
    puerta_2: { 
      title: 'PUERTA 2: ACCESO AMBULANCIAS', 
      type: 'equirectangular', 
      panorama: `${basePath}/puerta 1 para entrar a triaje.emergencia.jpeg`, 
      hotSpots: [{ pitch: -10, yaw: 180, type: 'scene', text: 'Volver', sceneId: 'puerta_principal', cssClass: 'custom-hotspot-navigation' }] 
    },
    laboratorio_1_2: {
      title: 'Puerta 1.2: LABORATORIO / IMAGENOLOGÍA',
      type: 'equirectangular',
      panorama: `${basePath}/puerta 1.2 laboratorio. imagenes.jpeg`,
      hotSpots: [{ pitch: 9.60580368533716, yaw: -54.1937821877935, type: 'scene', text: 'Volver a la Entrada', sceneId: 'puerta_principal', cssClass: 'custom-hotspot-navigation' }]
    },
    entrada_1_1: { 
      title: 'Interior: Triaje', 
      type: 'equirectangular', 
      panorama: `${basePath}/Entrada 1.1 ENTRA A TRIAJE.jpeg`, 
      hotSpots: [{ pitch: -10, yaw: 180, type: 'scene', text: 'Volver a la Entrada', sceneId: 'puerta_principal', cssClass: 'custom-hotspot-navigation' }] 
    },
    puerta_3: { title: 'PUERTA 3', type: 'equirectangular', panorama: `${basePath}/LISTA_entrada puerta 3.jpeg`, hotSpots: [{ pitch: -5, yaw: 5, type: 'scene', text: 'Entrar a Admisión/Farmacia', sceneId: 'puerta_3_1', cssClass: 'custom-hotspot-navigation' }] },
    puerta_3_1: { title: 'Admisión y Farmacia', type: 'equirectangular', panorama: `${basePath}/Puerta 3.1 está admisión. Farmacia emergencia. Farmacia consulta externa.jpeg`, hotSpots: [{ pitch: -10, yaw: 180, type: 'scene', text: 'Volver a Puerta 3', sceneId: 'puerta_3', cssClass: 'custom-hotspot-navigation' }] },
    puerta_4: { title: 'PUERTA 4', type: 'equirectangular', panorama: `${basePath}/LISTA_entrada puerta 4.jpeg`, hotSpots: [{ pitch: -5, yaw: 0, type: 'scene', text: 'Avanzar a Pasillo 4.1', sceneId: 'puerta_4_1', cssClass: 'custom-hotspot-navigation' }] },
    puerta_4_1: { title: 'Pasillo 4.1', type: 'equirectangular', panorama: `${basePath}/entrada de la puerta 4.1.jpeg`, hotSpots: [{ pitch: -5, yaw: 0, type: 'scene', text: 'Avanzar a Pasillo 4.2', sceneId: 'puerta_4_2', cssClass: 'custom-hotspot-navigation' }, { pitch: -10, yaw: 180, type: 'scene', text: 'Regresar', sceneId: 'puerta_4', cssClass: 'custom-hotspot-navigation' }] },
    puerta_4_2: { title: 'Pasillo 4.2', type: 'equirectangular', panorama: `${basePath}/entrada de la puerta 4.2.jpeg`, hotSpots: [{ pitch: -5, yaw: 0, type: 'scene', text: 'Ir a Rehabilitación', sceneId: 'puerta_4_3', cssClass: 'custom-hotspot-navigation' }, { pitch: -10, yaw: 180, type: 'scene', text: 'Regresar', sceneId: 'puerta_4_1', cssClass: 'custom-hotspot-navigation' }] },
    puerta_4_3: { title: 'ÁREA DE REHABILITACIÓN', type: 'equirectangular', panorama: `${basePath}/Entrada 4.3 ÁREA DE REHABILITACIÓN.jpeg`, hotSpots: [{ pitch: -10, yaw: 180, type: 'scene', text: 'Regresar', sceneId: 'puerta_4_2', cssClass: 'custom-hotspot-navigation' }] }
  };

  useEffect(() => {
    const styleId = "pannellum-custom-styles";
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.innerText = `
        .custom-hotspot-navigation { height: 40px; width: 40px; background: rgba(255, 255, 255, 0.3); border: 2px solid rgba(255, 255, 255, 0.8); border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s ease; backdrop-filter: blur(4px); }
        .custom-hotspot-navigation::after { content: '→'; font-size: 20px; color: #333; font-weight: bold; }
        .custom-hotspot-navigation:hover { background: rgba(255, 255, 255, 0.6); transform: scale(1.1); }
        .custom-hotspot-exit { height: 35px; width: 35px; background: rgba(0, 0, 0, 0.4); border: 2px solid white; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
        .custom-hotspot-exit::after { content: '🚑'; font-size: 16px; }
        .pnlm-tooltip span { font-family: Arial, sans-serif !important; font-weight: bold !important; text-transform: uppercase; background: rgba(0, 0, 0, 0.7) !important; border-radius: 4px !important; padding: 5px 10px !important; }
        .bot-talking-container { position: absolute; bottom: 20px; right: 20px; width: 80px; height: 80px; border-radius: 50%; background-color: #0055a5; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; overflow: hidden; border: 2px solid rgba(255,255,255,0.8); z-index: 1000; transition: transform 0.3s ease; cursor: pointer; }
        .bot-talking-container:hover { transform: scale(1.05); }
        .bot-talking-image { width: 100%; height: 100%; object-fit: contain; display: block; }
      `;
      document.head.appendChild(styleSheet);
    }

    if (!window.pannellum) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      const c = document.createElement('link');
      c.rel = 'stylesheet';
      c.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(c);
      document.body.appendChild(s);
    }
  }, []);

  const iniciarTour = (id) => {
    setMostrarPortada(false);
    setTitulo(panoramas[id].title);
    if (audioRef.current) audioRef.current.pause();

    setTimeout(() => {
      if (window.pannellum && viewerRef.current) {
        if (pannellumInstance.current) pannellumInstance.current.destroy();
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
          default: { firstScene: id, autoLoad: true, sceneFadeDuration: 1000, showControls: false, hotSpotDebug: false },
          scenes: panoramas
        });
      }
    }, 300);
  };

  const styles = {
    mainWrapper: { position: 'absolute', inset: 0, backgroundImage: `url(${fondoHospital})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px)', zIndex: 1 },
    interfaceWrapper: { position: 'relative', zIndex: 5, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    header: { backgroundColor: 'rgba(0, 85, 165, 0.9)', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '15px 15px 0 0', width: '100%', maxWidth: '700px' },
    logoSection: { padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' },
    logoBox: { backgroundColor: 'white', border: '3px solid #0055a5', borderRadius: '10px', padding: '10px 20px' },
    doorsSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', padding: '20px', width: '100%', maxWidth: '700px' },
    btnCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'left' },
    iconNumber: { width: '32px', height: '32px', minWidth: '32px', backgroundColor: '#0055a5', color: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px', fontWeight: 'bold' },
    arrow: { position: 'absolute', right: '12px', color: '#0055a5', fontSize: '16px' }
  };

  if (mostrarPortada) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '12px' }}>
        <div style={styles.mainWrapper}></div>
        <div style={styles.interfaceWrapper}>
          <div style={styles.header}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>RECORRIDO VIRTUAL</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>SELECCIONE UNA ENTRADA</p>
          </div>
          <div style={styles.logoSection}>
            <div style={styles.logoBox}><div style={{ color: '#0055a5', fontSize: '30px' }}>✚</div></div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, color: '#003366', fontSize: '20px', fontWeight: '900', lineHeight: 1 }}>HOSPITAL VERDI</h3>
              <h3 style={{ margin: 0, color: '#003366', fontSize: '20px', fontWeight: '900', lineHeight: 1 }}>CEVALLOS BALDA</h3>
            </div>
          </div>
          <div style={styles.doorsSection}>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_principal')}>
              <div style={styles.iconNumber}>1</div>
              <div><b style={{ fontSize: '14px', display: 'block', color: '#003366' }}>PUERTA 1</b><span style={{ fontSize: '11px', color: '#64748b' }}>Triaje / Emergencia / Lab</span></div>
              <span style={styles.arrow}>›</span>
            </button>
            <button style={{ ...styles.btnCard, border: '1px solid #dc2626' }} onClick={() => iniciarTour('puerta_2')}>
              <div style={{ ...styles.iconNumber, backgroundColor: '#dc2626' }}>2</div>
              <div><b style={{ fontSize: '14px', display: 'block', color: '#dc2626' }}>PUERTA 2 🚑</b><span style={{ fontSize: '11px', color: '#dc2626' }}>Acceso Ambulancias</span></div>
              <span style={{...styles.arrow, color: '#dc2626'}}>›</span>
            </button>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_3')}>
              <div style={styles.iconNumber}>3</div>
              <div><b style={{ fontSize: '14px', display: 'block', color: '#003366' }}>PUERTA 3</b><span style={{ fontSize: '11px', color: '#64748b' }}>Admisión / Farmacia</span></div>
              <span style={styles.arrow}>›</span>
            </button>
            <button style={styles.btnCard} onClick={() => iniciarTour('puerta_4')}>
              <div style={styles.iconNumber}>4</div>
              <div><b style={{ fontSize: '14px', display: 'block', color: '#003366' }}>PUERTA 4</b><span style={{ fontSize: '11px', color: '#64748b' }}>Rehabilitación</span></div>
              <span style={styles.arrow}>›</span>
            </button>
          </div>
        </div>
        <div className="bot-talking-container" onClick={reproducirVoz}>
          <img src={frameBot === 1 ? `${basePath}/bot1.png` : `${basePath}/bot2.png`} alt="Asistente Virtual" className="bot-talking-image" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0,85,165,0.9)', color: 'white', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', width: 'auto', whiteSpace: 'nowrap' }}>{titulo}</div>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
      <button onClick={() => setMostrarPortada(true)} style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: 'white', fontWeight: 'bold', color: '#0055a5', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '12px' }}>⬅ VOLVER AL MENÚ</button>
    </div>
  );
};

export default MedicalTour;