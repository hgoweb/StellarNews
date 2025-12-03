import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

import { SpotifyAccessTokenResponse } from '../src/types';

const clientIdKey = process.env.VITE_SPOTIFY_CLIENT_KEY;
const clientSecretKey = process.env.VITE_SPOTIFY_CLIENT_SECRET_KEY;

if (!clientIdKey || !clientSecretKey) {
  throw new Error(
    'Client ID or Client Secret Key not defined in environment variables.'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await axios.post<SpotifyAccessTokenResponse>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientIdKey as string,
        client_secret: clientSecretKey as string,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error generating Spotify access token:', error);
    res.status(500).json({ error: 'Spotify access token error' });
  }
}
