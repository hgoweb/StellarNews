import axios from 'axios';
import he from 'he';
import cacheProvider from './CacheProvider';
import { useEffect, useState } from 'react';
import Loader from '../Loader/Loader';

interface TranslatorProps {
  text: string;
  type: 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
  loaderPadding: string;
}

function Translator({ text, type, className, loaderPadding }: TranslatorProps) {
  const [translatedText, setTranslatedText] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const language = 'fr';

    const cachedTranslation = cacheProvider.get(language, text);
    if (cachedTranslation) {
      setTranslatedText(cachedTranslation);
      setIsLoading(false);
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

        let decodedText = he.decode(
          response.data.data.translations[0].translatedText
        );

        decodedText = decodedText.replace(/\+/g, ' ');

        cacheProvider.set(language, text, decodedText);
        setTranslatedText(decodedText);
      } catch (error) {
        console.error('Error fetching translation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [text]);

  if (isLoading) {
    return <Loader padding={loaderPadding} />;
  }

  switch (type) {
    case 'h1':
      return <h1 className={className}>{translatedText}</h1>;
    case 'h2':
      return <h2 className={className}>{translatedText}</h2>;
    case 'h3':
      return <h3 className={className}>{translatedText}</h3>;
    case 'p':
    default:
      return <p className={className}>{translatedText}</p>;
  }
}

export default Translator;
