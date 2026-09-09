// Runs once before the whole suite. Authorizes the Evinced SDK using the
// Service ID + API key (online mode - contacts the Evinced licensing server).
const { setCredentials } = require('@evinced/js-playwright-sdk');
require('dotenv').config();

module.exports = async function globalSetup() {
  const { EVINCED_SERVICE_ID, EVINCED_API_KEY } = process.env;

  if (!EVINCED_SERVICE_ID || !EVINCED_API_KEY) {
    throw new Error(
      'Missing EVINCED_SERVICE_ID / EVINCED_API_KEY. Copy .env.example to .env and fill it in.'
    );
  }

  try {
    await setCredentials({
      serviceId: EVINCED_SERVICE_ID,
      secret: EVINCED_API_KEY,
    });
    console.log('✓ Evinced SDK authorized');
  } catch (error) {
    throw new Error(`Evinced SDK authorization failed: ${error.message}`);
  }
};
