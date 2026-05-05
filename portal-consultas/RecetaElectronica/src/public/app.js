const URL_BASE = '/api';

// Referencias al DOM
const formConsulta = document.getElementById('form-consulta');
const modalRecetas = document.getElementById('modal-recetas');
const listaRecetasDiv = document.getElementById('lista-recetas');
const seccionBusqueda = document.getElementById('seccion-busqueda');
const seccionReceta = document.getElementById('seccion-receta');
const documentoPdfDiv = document.getElementById('documento-pdf');

// Elementos de feedback visual
const mensajeError = document.getElementById('mensaje-error');
const errorContenido = document.getElementById('error-contenido');
const btnConsultar = document.getElementById('btn-consultar');
const btnTexto = document.getElementById('btn-texto');
const btnLoader = document.getElementById('btn-loader');
const inputCedula = document.getElementById('documento');

// ==========================================
// MÁSCARA DE INPUT (Mejora UX)
// ==========================================
inputCedula.addEventListener('input', function (e) {
    // Reemplaza todo lo que no sea número (\D) por una cadena vacía
    this.value = this.value.replace(/\D/g, '');
    // Asegurar que no pase de 10 dígitos (por seguridad extra visual)
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

// ==========================================
// VALIDACIÓN MÓDULO 10 (Seguridad/Filtro)
// ==========================================
function validarCedulaEcuatoriana(cedula) {
    if (cedula.length !== 10) return false;
    
    // Los dos primeros dígitos corresponden al código de provincia (01 - 24)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false;

    // Extraemos el último dígito (dígito verificador)
    const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
    let sumaPares = 0;
    let sumaImpares = 0;

    for (let i = 0; i < 9; i++) {
        let digito = parseInt(cedula.charAt(i), 10);
        if (i % 2 === 0) {
            // Posiciones impares (índices 0, 2, 4...) se multiplican por 2
            digito = digito * 2;
            if (digito > 9) digito -= 9; // Si es mayor a 9, se le resta 9
            sumaImpares += digito;
        } else {
            // Posiciones pares (índices 1, 3, 5...) se suman tal cual
            sumaPares += digito;
        }
    }

    const sumaTotal = sumaPares + sumaImpares;
    // Buscamos la decena superior
    const decenaSuperior = Math.ceil(sumaTotal / 10) * 10;
    let resultadoCalculado = decenaSuperior - sumaTotal;
    
    if (resultadoCalculado === 10) resultadoCalculado = 0;

    return resultadoCalculado === digitoVerificador;
}

// Función para manejar el estado de carga
function toggleLoading(isLoading) {
    if (isLoading) {
        btnConsultar.disabled = true;
        btnTexto.classList.add('oculto');
        btnLoader.classList.remove('oculto');
        mensajeError.classList.add('oculto');
    } else {
        btnConsultar.disabled = false;
        btnTexto.classList.remove('oculto');
        btnLoader.classList.add('oculto');
    }
}

let requestCount = 0;
let firstRequestTime = null;

// 1. EVENTO: Consultar historial
formConsulta.addEventListener('submit', async (e) => {
    e.preventDefault();

    const doc = document.getElementById('documento').value.trim();
    const fecha = document.getElementById('fecha_nac').value;

    // Control de límite de peticiones (5 cada 15 minutos)
    const now = Date.now();
    if (firstRequestTime && now - firstRequestTime > 15 * 60 * 1000) {
        requestCount = 0;
        firstRequestTime = null;
    }

    if (requestCount >= 5) {
        mostrarError("Demasiadas peticiones, inténtelo en 15 minutos.");
        return;
    }

    // VALIDACIÓN datos
    if (!doc || !fecha) {
        mostrarError("Por favor, complete todos los campos.");
        return;
    }

    // Usamos el validador estricto Módulo 10 en lugar de solo Regex
    if (!validarCedulaEcuatoriana(doc)) {
        mostrarError("La cédula ingresada no es válida para Ecuador.");
        return;
    }

    // En lugar del toggleLoading tradicional, mostramos Skeletons en el modal
    mensajeError.classList.add('oculto');
    btnConsultar.disabled = true;
    
    // Preparar el modal con Skeletons (UX)
    document.getElementById('paciente-info-modal').innerHTML = `
        <div class="skeleton skeleton-text" style="width: 70%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 40%;"></div>
    `;
    listaRecetasDiv.innerHTML = `
        <div class="tarjeta-receta-mini skeleton-card"></div>
        <div class="tarjeta-receta-mini skeleton-card"></div>
        <div class="tarjeta-receta-mini skeleton-card"></div>
    `;
    
    // Mostramos el modal de inmediato para dar sensación de respuesta rápida
    modalRecetas.showModal();

    if (!firstRequestTime) {
        firstRequestTime = now;
    }
    requestCount++;

    try {
        const respuesta = await fetch(`${URL_BASE}/historial/${doc}/${fecha}`);
        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.mensaje || "No se encontraron recetas para estos datos.");
        }

        // Mostrar datos del paciente en el modal
        document.getElementById('paciente-info-modal').innerHTML = `
            <p><strong>Paciente:</strong> ${data.paciente.nombre_completo}</p>
            <p><strong>Edad:</strong> ${data.paciente.edad} años</p>
        `;

        // Limpiar y llenar la lista de recetas
        listaRecetasDiv.innerHTML = '';
        data.recetas.forEach(receta => {
            const fechaFormat = new Date(receta.fecha).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-receta-mini';
            tarjeta.innerHTML = `
                <div class="info-receta">
                    <h4><i data-lucide="calendar-check" size="14"></i> ${fechaFormat}</h4>
                    <p><strong>Área:</strong> ${receta.area}</p>
                    <p><strong>Médico:</strong> ${receta.medico}</p>
                </div>
                <button class="btn-ver-receta" onclick="cargarDetalleReceta(${receta.id_referencia})">
                    Ver Detalle
                </button>
            `;
            listaRecetasDiv.appendChild(tarjeta);
        });

        // Re-inicializar iconos de Lucide para las nuevas tarjetas
        if (window.lucide) lucide.createIcons();

        // Abrir el popup
        modalRecetas.showModal();

    } catch (error) {
        modalRecetas.close(); // Cerramos el modal si falla
        mostrarError(error.message);
    } finally {
        btnConsultar.disabled = false;
    }
});

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
    errorContenido.innerText = mensaje;
    mensajeError.classList.remove('oculto');
}

// 2. EVENTO: Cargar el detalle de receta
async function cargarDetalleReceta(idComprobante) {
    try {
        const respuesta = await fetch(`${URL_BASE}/receta/detalle/${idComprobante}`);
        const data = await respuesta.json();

        if (!respuesta.ok) throw new Error("Error al cargar detalle");

        // Ocultar modal y buscador, mostrar sección receta
        modalRecetas.close();
        seccionBusqueda.classList.add('oculto');
        seccionReceta.classList.remove('oculto');

        // Construir el HTML de la receta para el PDF
        const fechaRec = new Date(data.encabezado.fecha).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        let htmlReceta = `
            <div class="pdf-header">
                <div>
                    <h2 style="color: var(--primary);">RECETA MÉDICA</h2>
                </div>
                <div style="text-align: right;">
                    <p><strong>Fecha de Emisión:</strong></p>
                    <p>${fechaRec}</p>
                </div>
            </div>
            <div class="pdf-datos-paciente">
                <div>
                    <p><strong>PACIENTE:</strong></p>
                    <p>${data.encabezado.paciente}</p>
                    <p><strong>EDAD:</strong> ${data.encabezado.edad} años</p>
                </div>
                <div>
                    <p><strong>MÉDICO TRATANTE:</strong></p>
                    <p>${data.encabezado.medico}</p>
                </div>
            </div>
            <table class="pdf-tabla-medicamentos">
                <thead>
                    <tr>
                        <th style="width: 80px;">Cant.</th>
                        <th>Descripción del Medicamento</th>
                        <th style="width: 80px;">Días</th>
                        <th>Indicaciones / Posología</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.medicamentos.forEach(med => {
            htmlReceta += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${med.cantidad}</td>
                    <td>${med.medicamento}</td>
                    <td style="text-align: center;">${med.dias}</td>
                    <td>${med.indicaciones}</td>
                </tr>
            `;
        });

        documentoPdfDiv.innerHTML = htmlReceta;

        // Hacer scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        alert("Error al cargar los detalles de la receta.");
    }
}

// 3. EVENTOS: UI y Descarga PDF
document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    modalRecetas.close();
});

document.getElementById('btn-volver').addEventListener('click', () => {
    seccionReceta.classList.add('oculto');
    seccionBusqueda.classList.remove('oculto');
    formConsulta.reset(); // <- Esta línea borra los datos ingresados
});

document.getElementById('btn-descargar-pdf').addEventListener('click', () => {
    const elemento = document.getElementById('documento-pdf');
    const docNum = document.getElementById('documento').value;

    const opciones = {
        margin: 10,
        filename: `Receta_HPVCB_${docNum}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, letterRendering: true, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elemento).save();
});

// Manejo de conexión a Internet para el botón volver
window.addEventListener('offline', () => {
    document.getElementById('btn-volver').classList.add('oculto');
});

window.addEventListener('online', () => {
    document.getElementById('btn-volver').classList.remove('oculto');
});

// Chequeo inicial
if (!navigator.onLine) {
    document.getElementById('btn-volver').classList.add('oculto');
}
