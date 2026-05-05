const pool = require('../config/db');

const obtenerHistorial = async (req, res) => {
    const { documento, fecha_nacimiento } = req.params;

    // VALIDACIÓNES
    if (!documento || !fecha_nacimiento) {
        return res.status(400).json({ error: "El número de documento y Fecha de nacimiento son obligatorios" });
    }

    if (documento.length > 10 || fecha_nacimiento.length > 10) {
        return res.status(400).json({ error: "Formato de datos inválido" });
    }

    try {
        
        const query = `
            SELECT 
                -- 1. Datos del Paciente (esq_pacientes.pacientes)
                p.nombre1, 
                p.nombre2, 
                p.apellido1, 
                p.apellido2, 
                p.fecha_nacimiento,
                EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))::int AS edad,

                -- 2. Datos de Comprobante/Receta (inventario.comprobante)
                c.idcomprobante,   -- CLAVE para detalle
                c.fechaing,        -- Fecha de la receta
                c.idarea,          -- Para validación interna
                
                -- Transformación id Area
                CASE 
                    WHEN c.idarea = 3 THEN 'Consulta Externa'
                    WHEN c.idarea = 23 THEN 'Emergencia'
                    WHEN c.idarea = 31 THEN 'Emergencia Observación'
                    ELSE 'Otra Área'
                END AS nombre_area,

                -- 3. Datos del Médico (esq_datos_personales.personal)
                per.nombre1 AS medico_nombre,
                per.apellido1 AS medico_apellido1,
                per.apellido2 AS medico_apellido2

            FROM esq_pacientes.pacientes p
            
            -- JOIN Pac/Receta
            INNER JOIN inventario.comprobante c 
                ON p.id_paciente = c.idpaciente

            -- JOIN Rec/Med
            INNER JOIN esq_datos_personales.personal per 
                ON c.idmedico = per.idpersonal

            WHERE 
                p.documento = $1  -- Filtro por documento
                AND p.fecha_nacimiento = $2 -- Filtro por fecha
                AND c.fechaing >= CURRENT_DATE - INTERVAL '6 months' -- Filtro últimos 6 meses
                AND c.idarea IN (3, 23) -- Filtro área

            ORDER BY c.fechaing DESC; -- Ordena por la más reciente
        `;

        // Ejecutar consulta con Pool de conexiones
        const result = await pool.query(query, [documento, fecha_nacimiento]);

        // Si no hay resultados, devolvemos 404
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                mensaje: "No se encontraron recetas recientes.Verifique datos ingresados" 
            });
        }

        // RESPUESTA
        // Datos del paciente y Recetas
        const primerRegistro = result.rows[0];

        const respuesta = {
            paciente: {
                nombre_completo: `${primerRegistro.nombre1} ${primerRegistro.nombre2 || ''} ${primerRegistro.apellido1} ${primerRegistro.apellido2}`.trim(),
                edad: primerRegistro.edad,
                documento: documento
            },
            // Mapeo recetas encontradas
            recetas: result.rows.map(row => ({
                id_referencia: row.idcomprobante, // ID oculto
                fecha: row.fechaing,
                area: row.nombre_area,
                medico: `Dr/a. ${row.medico_nombre} ${row.medico_apellido1} ${row.medico_apellido2}`.trim()
            }))
        };

        res.json(respuesta);

    } catch (error) {
        console.error("Error en obtenerHistorial:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Detalle Receta

const obtenerDetalleReceta = async (req, res) => {
    const { idcomprobante } = req.params;

    if (!idcomprobante) {
        return res.status(400).json({ error: "El ID del comprobante es obligatorio" });
    }

    try {
        const query = `
            SELECT 
                -- ENCABEZADO: Datos Pac/Med
                c.fechaing AS fecha_receta,
                p.nombre1 AS pac_nom1, p.nombre2 AS pac_nom2, 
                p.apellido1 AS pac_ape1, p.apellido2 AS pac_ape2,
                EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) AS edad_paciente, -- Calculo Edad
                per.nombre1 AS med_nom, per.apellido1 AS med_ape1, per.apellido2 AS med_ape2,

                -- DETALLE: Datos medicamento
                dc.cantidad,
                prod.nprod AS nombre_medicamento,
                dr.duracion AS dias_tratamiento,
                dr.uso AS indicaciones

            FROM inventario.comprobante c
            
            -- Joins Encabezado
            JOIN esq_pacientes.pacientes p ON c.idpaciente = p.id_paciente
            JOIN esq_datos_personales.personal per ON c.idmedico = per.idpersonal

            -- Joins Detalle de receta
            JOIN inventario.detallecomprobante dc ON c.idcomprobante = dc.idcomprobante
            JOIN inventario.productoxbodega pxb ON dc.idbodprod = pxb.idbodprod
            JOIN inventario.productos prod ON pxb.idprod = prod.idprod
            JOIN inventario.detallereceta dr ON dc.iddetalle = dr.iddetalle

            WHERE c.idcomprobante = $1;
        `;

        const result = await pool.query(query, [idcomprobante]);

        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron detalles para esta receta." });
        }

        // RESPUESTA
        // Datos del encabezado y medicamentos
        const primerReg = result.rows[0];

        const respuestaDetalle = {
            encabezado: {
                fecha: primerReg.fecha_receta,
                paciente: `${primerReg.pac_nom1} ${primerReg.pac_nom2 || ''} ${primerReg.pac_ape1} ${primerReg.pac_ape2}`.trim(),
                edad: primerReg.edad_paciente,
                medico: `Dr. ${primerReg.med_nom} ${primerReg.med_ape1} ${primerReg.med_ape2}`.trim()
            },
            // Mapeo de lista de medicamentos
            medicamentos: result.rows.map(row => ({
                cantidad: row.cantidad,
                medicamento: row.nombre_medicamento,
                dias: row.dias_tratamiento,
                indicaciones: row.indicaciones
            }))
        };

        res.json(respuestaDetalle);

    } catch (error) {
        console.error("Error en obtenerDetalleReceta:", error);
        res.status(500).json({ error: "Error interno al consultar el detalle de la receta" });
    }
};

//exportar funciones
module.exports = { 
    obtenerHistorial, 
    obtenerDetalleReceta 
};

