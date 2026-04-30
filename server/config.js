require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  REFRESH_INTERVAL: process.env.REFRESH_INTERVAL || 5000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret',
};
