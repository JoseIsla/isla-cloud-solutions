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

const BRAND = {
  name: 'Isla Cloud Solutions',
  url: 'https://www.islacloudsolutions.com',
  // Colores extraídos del diseño del sitio
  navy: '#0f172a',
  navyLight: '#1e3a5f',
  blue: '#0066ff',
  cyan: '#00bfff',
  textDark: '#1e293b',
  textMuted: '#475569',
  textLight: '#94a3b8',
  borderColor: '#e2e8f0',
  bgLight: '#f8fafc',
};

function brandHeader(title) {
  return `
    <div style="background: linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%); padding: 28px 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <img src="${BRAND.url}/assets/logos/logotipo-blanco.png" alt="${BRAND.name}" style="height: 36px; margin-bottom: 16px;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-family: 'Space Grotesk', Arial, sans-serif;">${title}</h1>
    </div>
  `;
}

function brandFooter() {
  return `
    <div style="margin-top: 24px; padding: 20px 30px; background: ${BRAND.bgLight}; border-top: 1px solid ${BRAND.borderColor}; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="margin: 0 0 4px; font-size: 13px; color: ${BRAND.textMuted};">
        <a href="${BRAND.url}" style="color: ${BRAND.blue}; text-decoration: none; font-weight: 600;">${BRAND.name}</a>
      </p>
      <p style="margin: 0; font-size: 11px; color: ${BRAND.textLight};">
        Soluciones tecnológicas a medida · España
      </p>
    </div>
  `;
}

/**
 * Envía un email de notificación al administrador cuando se recibe un nuevo contacto.
 */
async function sendContactNotification({ nombre, email, empresa, telefono, mensaje }, toEmail) {
  const transport = getTransporter();
  if (!transport) return;

  const fromName = process.env.SMTP_FROM_NAME || BRAND.name;
  const fromEmail = process.env.SMTP_USER;

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `Nuevo contacto: ${nombre}`,
      html: `
        <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${brandHeader('📩 Nuevo mensaje de contacto')}
          <div style="border: 1px solid ${BRAND.borderColor}; border-top: none; padding: 24px 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155; width: 120px;">Nombre:</td>
                <td style="padding: 8px 0; color: ${BRAND.textDark};">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: ${BRAND.blue};">${email}</a></td>
              </tr>
              ${empresa ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #334155;">Empresa:</td><td style="padding: 8px 0; color: ${BRAND.textDark};">${empresa}</td></tr>` : ''}
              ${telefono ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #334155;">Teléfono:</td><td style="padding: 8px 0;"><a href="tel:${telefono}" style="color: ${BRAND.blue};">${telefono}</a></td></tr>` : ''}
            </table>
            <div style="margin-top: 16px; padding: 16px; background: ${BRAND.bgLight}; border-radius: 8px; border-left: 4px solid ${BRAND.blue};">
              <p style="margin: 0 0 4px; font-weight: bold; color: #334155;">Mensaje:</p>
              <p style="margin: 0; color: ${BRAND.textMuted}; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: ${BRAND.textLight};">
              Recibido el ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
            </p>
          </div>
          ${brandFooter()}
        </div>
      `,
    });
    console.log('✅ Email de notificación enviado a', toEmail);
  } catch (err) {
    console.error('❌ Error enviando email de notificación:', err.message);
  }
}

/**
 * Envía un email de confirmación al usuario que envió el formulario de contacto.
 */
async function sendContactConfirmation({ nombre, email }) {
  const transport = getTransporter();
  if (!transport) return;

  const fromName = process.env.SMTP_FROM_NAME || BRAND.name;
  const fromEmail = process.env.SMTP_USER;

  try {
    await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `Gracias por contactarnos, ${nombre}`,
      html: `
        <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${brandHeader('¡Hemos recibido tu mensaje!')}
          <div style="border: 1px solid ${BRAND.borderColor}; border-top: none; padding: 30px;">
            <p style="font-size: 16px; color: ${BRAND.textDark}; margin: 0 0 16px; line-height: 1.6;">
              Hola <strong>${nombre}</strong>,
            </p>
            <p style="font-size: 15px; color: ${BRAND.textMuted}; margin: 0 0 20px; line-height: 1.7;">
              Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje correctamente y nuestro equipo lo revisará lo antes posible.
            </p>
            <p style="font-size: 15px; color: ${BRAND.textMuted}; margin: 0 0 24px; line-height: 1.7;">
              Te responderemos en un plazo máximo de <strong style="color: ${BRAND.textDark};">24-48 horas laborables</strong>.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${BRAND.url}/servicios" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan}); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">
                Descubre nuestros servicios
              </a>
            </div>

            <div style="padding: 20px; background: ${BRAND.bgLight}; border-radius: 10px; border: 1px solid ${BRAND.borderColor};">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: ${BRAND.textDark};">¿Necesitas algo urgente?</p>
              <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.6;">
                Puedes contactarnos directamente en 
                <a href="mailto:${fromEmail}" style="color: ${BRAND.blue}; text-decoration: none; font-weight: 500;">${fromEmail}</a>
              </p>
            </div>
          </div>
          ${brandFooter()}
        </div>
      `,
    });
    console.log('✅ Email de confirmación enviado a', email);
  } catch (err) {
    console.error('❌ Error enviando email de confirmación:', err.message);
  }
}

module.exports = { sendContactNotification, sendContactConfirmation };
