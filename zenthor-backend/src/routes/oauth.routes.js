const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const supabase = require('../config/supabase');

// Configuración de OAuth de Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL}/api/oauth/google/callback`
);

// Iniciar flujo
router.get('/google', (req, res) => {
  const userId = req.query.user_id;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.materials.readonly',
      'https://www.googleapis.com/auth/calendar.readonly'
    ],
    state: userId
  });
  res.redirect(url);
});

// Callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Guardar tokens en Supabase
  await supabase.from('fuentes_conectadas').upsert({
    usuario_id: state,
    tipo: 'google_classroom',
    nombre: 'Google Classroom',
    configuracion: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    },
    activo: true,
    ultima_sincronizacion: new Date()
  });

  res.redirect(`${process.env.FRONTEND_URL}/conexiones?success=google`);
});

// Webhook para sincronización automática (opcional, Classroom no tiene webhooks nativos)
// En su lugar usaremos polling con n8n
// En oauth.routes.js
router.get('/notion', (req, res) => {
  const userId = req.query.user_id;
  const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.NOTION_CLIENT_ID}&redirect_uri=${process.env.API_URL}/api/oauth/notion/callback&response_type=code&owner=user&state=${userId}`;
  res.redirect(notionAuthUrl);
});

router.get('/notion/callback', async (req, res) => {
  const { code, state } = req.query;
  // Intercambiar code por access_token
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${process.env.API_URL}/api/oauth/notion/callback`,
      client_id: process.env.NOTION_CLIENT_ID,
      client_secret: process.env.NOTION_CLIENT_SECRET
    })
  });
  const tokens = await response.json();

  await supabase.from('fuentes_conectadas').upsert({
    usuario_id: state,
    tipo: 'notion',
    nombre: 'Notion',
    configuracion: { access_token: tokens.access_token, workspace_id: tokens.workspace_id },
    activo: true
  });
  res.redirect(`${process.env.FRONTEND_URL}/conexiones?success=notion`);
});

module.exports = router;