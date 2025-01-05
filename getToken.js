import { config } from "dotenv";
config();

const response = await fetch(process.env.AUTH0_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      grant_type: 'client_credentials'
    })
  });
  
  const data = await response.json();
  console.log(data.access_token);