const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const enviarWhatsApp = async (to, mensaje) => {
  try {
    const message = await client.messages.create({
      body: mensaje,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { enviarWhatsApp };