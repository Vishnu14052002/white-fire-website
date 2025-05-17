const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware setup - add these AFTER creating the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Store tokens in memory (use a database in production)
let tokens = {
  access_token: null,
  refresh_token: null,
  expiry: null
};

// OAuth flow routes
app.get('/auth', (req, res) => {
  const authUrl = `https://accounts.zoho.eu/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(process.env.ZOHO_REDIRECT_URI)}`;
  res.redirect(authUrl);
});

app.get('/oauth/callback', async (req, res) => {
  const authCode = req.query.code;
  const location = req.query.location || 'eu';
  
  if (!authCode) {
    return res.status(400).send('Authorization code not found');
  }
  
  try {
    const params = new URLSearchParams();
    params.append('code', authCode);
    params.append('client_id', process.env.ZOHO_CLIENT_ID);
    params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
    params.append('redirect_uri', process.env.ZOHO_REDIRECT_URI);
    params.append('grant_type', 'authorization_code');
    
    const response = await axios.post(`https://accounts.zoho.${location}/oauth/v2/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Store tokens
    tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expiry: Date.now() + (response.data.expires_in * 1000)
    };
    
    res.send(`
      <h1>Authorization successful!</h1>
      <p>Access token received.</p>
      <a href="/api/leads">View Leads</a>
    `);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).send('Failed to get access token');
  }
});

// CRM API routes
app.get('/api/leads', async (req, res) => {
  if (!tokens.access_token) {
    return res.status(401).json({ error: 'Not authenticated. Please visit /auth to connect to Zoho.' });
  }
  
  try {
    const response = await axios.get('https://www.zohoapis.eu/crm/v2/Leads', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching leads:', error.response?.data || error.message);
    
    // If unauthorized, token might be expired
    if (error.response?.status === 401) {
      res.status(401).json({ 
        error: 'Token expired or invalid', 
        message: 'Please refresh token or re-authenticate'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch leads', 
        details: error.response?.data || error.message 
      });
    }
  }
});

// Add a route to create a test lead
app.get('/api/create-test-lead', async (req, res) => {
  if (!tokens.access_token) {
    return res.status(401).json({ error: 'Not authenticated. Please visit /auth to connect to Zoho.' });
  }
  
  try {
    const lead = {
      Last_Name: "Test Lead " + Date.now(),
      Company: "Test Company",
      Email: `test${Date.now()}@example.com`,
      Phone: "1234567890"
    };
    
    const response = await axios.post('https://www.zohoapis.eu/crm/v2/Leads', {
      data: [lead]
    }, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      message: 'Test lead created successfully',
      lead: response.data
    });
  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create test lead', 
      details: error.response?.data || error.message 
    });
  }
});

// Add the form submission handler
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, phone, course, message } = req.body;
    
    console.log('Form submission received:', { name, email, phone, course, message });
    
    // Validate the form data
    if (!name || !email || !phone || !course || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Use the environment variable directly if tokens object is not available
    const accessToken = tokens?.access_token || process.env.ZOHO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return res.status(500).json({ 
        message: 'Server configuration error. Please try again later or contact us directly.' 
      });
    }
    
    // Create a lead in Zoho CRM
    const leadData = {
      Last_Name: name,
      Email: email,
      Phone: phone,
      Description: `Course: ${course}\n\n${message}`,
      Lead_Source: 'Website Contact Form'
    };
    
    const response = await axios.post('https://www.zohoapis.eu/crm/v2/Leads', {
      data: [leadData]
    }, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Lead created in Zoho CRM:', response.data);
    
    res.status(200).json({ 
      message: 'Thank you for your interest! Your message has been received and we will contact you shortly.' 
    });
  } catch (error) {
    console.error('Error processing form submission:', error.response?.data || error.message);
    
    // Check for expired token
    if (error.response?.status === 401) {
      // You might want to trigger a token refresh here
      console.log('Token expired, refreshing...');
      // For now, just inform the client
      return res.status(503).json({ 
        message: 'Service temporarily unavailable. Please try again in a few minutes.' 
      });
    }
    
    res.status(500).json({ 
      message: 'There was an error processing your request. Please try again later or contact us directly.' 
    });
  }
});

// Add user to Zoho CRM
app.post('/add-user-to-crm', async (req, res) => {
  try {
    const { name, email, phone, authProvider, location } = req.body;
    
    console.log('Adding user to Zoho CRM:', { name, email, phone, authProvider, location });
    
    // Validate the required data
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    // Check if we have a valid token
    if (!tokens.access_token) {
      return res.status(401).json({ 
        message: 'Not authenticated with Zoho CRM. Please ensure the OAuth flow is completed.' 
      });
    }
    
    // Format location information for Zoho CRM
    let locationInfo = '';
    if (location && Object.keys(location).length > 0) {
      locationInfo = `Location: ${location.fullAddress || ''}\n`;
      
      if (location.city) locationInfo += `City: ${location.city}\n`;
      if (location.state) locationInfo += `State: ${location.state}\n`;
      if (location.country) locationInfo += `Country: ${location.country}\n`;
      if (location.postalCode) locationInfo += `Postal Code: ${location.postalCode}\n`;
      
      if (location.latitude && location.longitude) {
        locationInfo += `Coordinates: ${location.latitude}, ${location.longitude}\n`;
      }
    }
    
    // Create a lead in Zoho CRM
    const leadData = {
      Last_Name: name,
      Email: email,
      Phone: phone || '',
      Description: `New user registration via ${authProvider}\n\n${locationInfo}`,
      Lead_Source: 'Website Registration',
      City: location?.city || '',
      State: location?.state || '',
      Country: location?.country || '',
      Zip_Code: location?.postalCode || ''
    };
    
    const response = await axios.post('https://www.zohoapis.eu/crm/v2/Leads', {
      data: [leadData]
    }, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('User added to Zoho CRM:', response.data);
    
    res.status(200).json({ 
      message: 'User registered and added to CRM successfully',
      crmData: response.data
    });
  } catch (error) {
    console.error('Error adding user to CRM:', error.response?.data || error.message);
    
    // Check for expired token
    if (error.response?.status === 401) {
      // Try to refresh the token
      try {
        await refreshToken();
        
        // Retry the original request with the new token
        return addUserToCRM(req, res);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return res.status(503).json({ 
          message: 'Service temporarily unavailable. Please try again in a few minutes.' 
        });
      }
    }
    
    res.status(500).json({ 
      message: 'There was an error adding user to CRM',
      error: error.response?.data || error.message
    });
  }
});

// Add a token refresh route
app.get('/refresh-token', async (req, res) => {
  try {
    await refreshToken();
    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ 
      error: 'Failed to refresh token', 
      details: error.response?.data || error.message 
    });
  }
});

// Function to refresh token
async function refreshToken() {
  if (!tokens.refresh_token) {
    throw new Error('No refresh token available');
  }
  
  const params = new URLSearchParams();
  params.append('refresh_token', tokens.refresh_token);
  params.append('client_id', process.env.ZOHO_CLIENT_ID);
  params.append('client_secret', process.env.ZOHO_CLIENT_SECRET);
  params.append('grant_type', 'refresh_token');
  
  const response = await axios.post(`https://accounts.zoho.eu/oauth/v2/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  // Update tokens
  tokens = {
    access_token: response.data.access_token,
    refresh_token: tokens.refresh_token, // Keep the existing refresh token
    expiry: Date.now() + (response.data.expires_in * 1000)
  };
  
  console.log('Token refreshed successfully');
  return tokens;
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`To start OAuth flow, visit: http://localhost:${port}/auth`);
});