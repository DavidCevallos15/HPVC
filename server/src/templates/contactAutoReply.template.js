const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const contactAutoReplyTemplate = ({ nombre, asunto }) => {
  const safeName = escapeHtml(nombre);
  const safeSubject = escapeHtml(asunto);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Solicitud recibida - HPVC</title>
</head>
<body style="margin:0; padding:0; background:#F1F5F9; font-family:Arial, Helvetica, sans-serif; color:#1A1A2E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:#F1F5F9;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:640px; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,58,112,0.10);">
          <tr>
            <td style="background:#FFFFFF; padding:14px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="76" valign="middle">
                    <img src="cid:escudo-ecuador-hpvc" width="62" height="62" alt="Escudo del Ecuador" style="display:block; width:62px; height:62px; object-fit:contain; border:0;">
                  </td>
                  <td align="right" valign="middle">
                    <img src="cid:logo-msp-hpvc" width="190" alt="Ministerio de Salud Pública" style="display:block; width:190px; max-width:100%; height:auto; margin-left:auto; border:0;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#003A70; padding:20px 28px; border-bottom:5px solid #F5C400;">
              <h2 style="margin:0; color:#FFFFFF; font-size:18px; line-height:1.35;">Hospital Provincial Verdi Cevallos Balda</h2>
              <p style="margin:6px 0 0; color:#D6E6F5; font-size:13px;">Portal web institucional</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 16px;">
              <span style="display:inline-block; background:#D6E6F5; color:#003A70; font-size:12px; font-weight:bold; padding:7px 12px; border-radius:999px;">
                Solicitud recibida
              </span>
              <h1 style="margin:18px 0 10px; font-size:24px; line-height:1.25; color:#003A70;">Hemos recibido su solicitud</h1>
              <p style="margin:0; font-size:15px; line-height:1.7; color:#64748B;">
                Estimado/a <strong style="color:#1A1A2E;">${safeName}</strong>, su mensaje enviado desde el formulario
                <strong style="color:#1A1A2E;">Contáctenos</strong> fue recibido correctamente.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F8FAFC; border:1px solid #D6E6F5; border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px; font-size:13px; color:#64748B;">Asunto registrado</p>
                    <p style="margin:0; font-size:16px; line-height:1.5; color:#1A1A2E; font-weight:bold;">${safeSubject}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 30px;">
              <p style="margin:0 0 14px; font-size:15px; line-height:1.7; color:#1A1A2E;">
                Hemos recibido su solicitud enviada desde el portal web institucional del Hospital Provincial Verdi Cevallos Balda.
              </p>
              <p style="margin:0 0 14px; font-size:15px; line-height:1.7; color:#1A1A2E;">
                Para atención, seguimiento o entrega de documentación adicional, puede acercarse a nuestras instalaciones
                en los horarios establecidos por la institución.
              </p>
              <p style="margin:0; font-size:15px; line-height:1.7; color:#1A1A2E;">Gracias por comunicarse con nosotros.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#080B5E; padding:22px 28px; border-top:4px solid #007A4D;">
              <p style="margin:0 0 8px; color:#FFFFFF; font-size:14px; font-weight:bold;">Hospital Provincial Verdi Cevallos Balda</p>
              <p style="margin:0; color:#D6E6F5; font-size:13px; line-height:1.6;">
                Calle 12 de Marzo y Rocafuerte, Portoviejo, Ecuador<br>
                Correo institucional: hospital.portoviejo@mspz4.gob.ec
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 28px; background:#FFFFFF;">
              <p style="margin:0; font-size:12px; line-height:1.5; color:#64748B;">
                Este es un mensaje automático generado desde la página web institucional del HPVC.
                Por favor, no responda directamente a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { contactAutoReplyTemplate, escapeHtml };
