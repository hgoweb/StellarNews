import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

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

  const { itemId, type } = req.query;

  if (!itemId || typeof itemId !== 'string') {
    return res.status(400).json({ error: 'ID is required' });
  }

  const host = req.headers.host;
  const protocol = req.headers['forwarded'] || 'http';

  try {
    const response = await axios.get(
      `${protocol}://${host}/api/spotifyAccessToken`
    );

    const accessToken = response.data.accessToken;

    if (!accessToken) {
      console.error('Access Token not found');
      return;
    }

    const itemResponse = await axios.get(
      `https://api.spotify.com/v1/${type}/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(200).json(itemResponse.data);
  } catch (error) {
    console.error('Error fetching item:', error);
    return res.status(500).json({ error: 'Failed to fetch item' });
  }
}
