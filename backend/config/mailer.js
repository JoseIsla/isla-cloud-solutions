const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn('⚠️  SMTP no configurado. Las notificaciones por email están desactivadas.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Envía un email de notificación al administrador cuando se recibe un nuevo contacto.
 */
async function sendContactNotification({ nombre, email, empresa, telefono, mensaje }, toEmail) {
  const transport = getTransporter();
  if (!transport) return;

  const fromName = process.env.SMTP_FROM_NAME || 'Isla Cloud Solutions';
  const fromEmail = process.env.SMTP_USER;

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `Nuevo contacto: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 24px 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">📩 Nuevo mensaje de contacto</h1>
          </div>
          <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px 30px; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155; width: 120px;">Nombre:</td>
                <td style="padding: 8px 0; color: #1e293b;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              ${empresa ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #334155;">Empresa:</td><td style="padding: 8px 0; color: #1e293b;">${empresa}</td></tr>` : ''}
              ${telefono ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #334155;">Teléfono:</td><td style="padding: 8px 0;"><a href="tel:${telefono}" style="color: #2563eb;">${telefono}</a></td></tr>` : ''}
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 4px; font-weight: bold; color: #334155;">Mensaje:</p>
              <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
              Recibido el ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
            </p>
          </div>
        </div>
      `,
    });
    console.log('✅ Email de notificación enviado a', toEmail);
  } catch (err) {
    console.error('❌ Error enviando email de notificación:', err.message);
  }
}

module.exports = { sendContactNotification };
