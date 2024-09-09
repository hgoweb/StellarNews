import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

import { ApodResponse } from '../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await axios.get<ApodResponse>(
      'https://api.nasa.gov/planetary/apod',
      {
        params: {
          api_key: process.env.VITE_NASA_API_KEY,

          // date: '2021-09-17',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Apod error' });
  }
}
