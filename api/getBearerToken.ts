import { VercelRequest, VercelResponse } from '@vercel/node';
import axios, { AxiosResponse } from 'axios';
import qs from 'qs';

const apiKey = process.env.VITE_TWITTER_API_KEY;
const apiSecretKey = process.env.VITE_TWITTER_SECRET_KEY;

if (!apiKey || !apiSecretKey) {
  throw new Error(
    'API Key or API Secret Key not defined in environment variables.'
  );
}

const credentials = Buffer.from(`${apiKey}:${apiSecretKey}`).toString('base64');

interface BearerTokenResponse {
  token_type: string;
  access_token: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Custom-Header'
  );

  try {
    const response: AxiosResponse<BearerTokenResponse> = await axios.post(
      'https://api.x.com/oauth2/token',
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      }
    );

    const bearerToken = response.data.access_token;
    res.status(200).json({ bearerToken });
  } catch (error) {
    console.error('Error generating Bearer Token:', error);
    res.status(500).json({ error: 'Failed to generate Bearer Token' });
  }
}
