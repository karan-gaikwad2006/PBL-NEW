const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getEnv } = require('./env');

const projectId = getEnv('FIREBASE_PROJECT_ID');
const clientEmail = getEnv('FIREBASE_CLIENT_EMAIL');
const privateKey = getEnv('FIREBASE_PRIVATE_KEY');

if (projectId && clientEmail && privateKey) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
        projectId,
        clientEmail,
        // Replace escaped newlines if they are present in the env var
        privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    console.log('[FIREBASE] Admin SDK initialized');
  } catch (error) {
    console.error('[FIREBASE] Admin SDK initialization error:', error.message);
  }
} else {
  console.warn('[FIREBASE] Admin SDK not initialized: Missing environment variables');
}

module.exports = { getApps };
