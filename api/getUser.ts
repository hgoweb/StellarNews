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

  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  const host = req.headers.host;
  const protocol = req.headers['forwarded'] || 'http';

  try {
    const response = await axios.get(
      `${protocol}://${host}/api/getBearerToken`
    );

    const bearerToken = response.data.bearerToken;

    if (!bearerToken) {
      console.error('Bearer Token not found');
      return;
    }

    const userResponse = await axios.get(
      `https://api.x.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params: {
          'user.fields':
            'created_at,description,entities,id,location,name,profile_image_url,public_metrics,url,username,verified',
        },
      }
    );

    return res.status(200).json(userResponse.data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}
