// test-env.js
require('dotenv').config();

console.log('Client ID:', process.env.ZOHO_CLIENT_ID);
console.log('Client Secret:', process.env.ZOHO_CLIENT_SECRET);
console.log('Redirect URI:', process.env.ZOHO_REDIRECT_URI);
