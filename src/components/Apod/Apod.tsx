import axios from 'axios';
import { useEffect, useState } from 'react';
import { ApodResponse } from '../../types';
import './Apod.scss';
import { useTranslation } from 'react-i18next';
import Translator from '../Translator/Translator';

type ApodProps = {
  randomize: boolean;
  translate: boolean;
};

function Apod({ randomize, translate }: ApodProps) {
  const [apod, setApod] = useState<ApodResponse | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const response = await axios.get('/api/apod', {
          params: {
            count: randomize ? 1 : undefined,
          },
        });

        const data = response.data;

        setApod(data);
      } catch (error) {
        console.error('Error fetching APOD:', error);
      }
    };

    fetchApod();
  }, [randomize]);

  return (
    <div>
      <h2 className="apodTitle">{t('home.apod-title')}</h2>
      {apod && (
        <div className="apodContainer">
          {translate ? (
            <Translator text={apod.title} type="h3" />
          ) : (
            <h3>{apod.title}</h3>
          )}

          <div className="apodContent">
            <img src={apod.url} alt={apod.title} />
            {translate ? (
              <Translator text={apod.explanation} type="p" />
            ) : (
              <p>{apod.explanation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Apod;
