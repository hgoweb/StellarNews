import axios from 'axios';
import he from 'he';
import cacheProvider from './CacheProvider';

import { useEffect, useState } from 'react';

interface TranslatorProps {
  text: string;
  type: 'p' | 'h1' | 'h2' | 'h3';
}

function Translator({ text, type }: TranslatorProps) {
  const [translatedText, setTranslatedText] = useState<string>();

  useEffect(() => {
    const language = 'fr';

    const cachedTranslation = cacheProvider.get(language, text);
    if (cachedTranslation) {
      setTranslatedText(cachedTranslation);
      return;
    }

    const fetchTranslation = async () => {
      try {
        const response = await axios.get('/api/translate', {
          params: {
            text,
            target: 'fr',
          },
        });
        const decodedText = he.decode(
          response.data.data.translations[0].translatedText
        );

        cacheProvider.set(language, text, decodedText);

        setTranslatedText(decodedText);
      } catch (error) {
        console.error('Error fetching translation:', error);
      }
    };

    fetchTranslation();
  }, [text]);

  switch (type) {
    case 'h1':
      return <h1>{translatedText}</h1>;
    case 'h2':
      return <h2>{translatedText}</h2>;
    case 'h3':
      return <h3>{translatedText}</h3>;
    case 'p':
    default:
      return <p>{translatedText}</p>;
  }
}

export default Translator;
