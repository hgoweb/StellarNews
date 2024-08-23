import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

interface TranslationResponse {
  data: {
    translations: {
      translatedText: string;
      detectedSourceLanguage: string;
    }[];
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { text, target = 'fr' } = req.query;

  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await axios.get<TranslationResponse>(
      'https://translation.googleapis.com/language/translate/v2',
      {
        params: {
          q: text,
          target,
          key: process.env.VITE_GOOGLE_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Translation error' });
  }
}
