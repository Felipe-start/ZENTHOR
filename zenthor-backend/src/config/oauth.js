const { google } = require('googleapis');

// Google OAuth2 Client
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL || 'https://zenthor.onrender.com'}/api/conexiones/google/callback`
);

// Microsoft OAuth2 Client
const msalConfig = {
  auth: {
    clientId: process.env.TEAMS_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.TEAMS_CLIENT_SECRET
  }
};

module.exports = { googleOAuth2Client, msalConfig };