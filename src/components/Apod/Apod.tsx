import axios from 'axios';
import { useEffect, useState } from 'react';
import { ApodResponse } from '../../types';
import './Apod.scss';
import { useTranslation } from 'react-i18next';
import Translator from '../Translator/Translator';
import Loader from '../Loader/Loader';
import { motion } from 'framer-motion';

type ApodProps = {
  translate: boolean;
  animationKey: number;
};

function Apod({ translate, animationKey }: ApodProps) {
  const [apod, setApod] = useState<ApodResponse | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchApod = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/apod');

        const data = response.data;

        setApod(data);
      } catch (error) {
        console.error('Error fetching APOD:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApod();
  }, []);

  return (
    <div id="apod">
      <motion.h2
        key={`apodTitle-${animationKey}`}
        className="apodTitle"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: 'anticipate', delay: 0.5 }}
      >
        {t('home.apod.title')}
      </motion.h2>

      <motion.p
        key={`apodSubtitle-${animationKey}`}
        className="apodSubtitle"
        initial={{ opacity: 0, x: 70 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: 'circOut', delay: 0.5 }}
      >
        {t('home.apod.subtitle')}
      </motion.p>

      <div className="apodContainer">
        {isLoading ? (
          <Loader padding="2rem" />
        ) : translate ? (
          <Translator
            text={apod ? apod.title : ''}
            type="h3"
            loaderPadding="2rem"
          />
        ) : (
          <h3>{apod ? apod.title : ''}</h3>
        )}

        {isLoading ? (
          <Loader padding="10rem" />
        ) : (
          <div className="apodContent">
            <div className="apodContentLeft">
              {apod?.media_type === 'image' ? (
                <img src={apod.url} alt={apod.title} />
              ) : (
                <iframe
                  className="apodIframe"
                  src={apod?.url}
                  allow="autoplay; encrypted-media"
                  style={{ borderRadius: '7px' }}
                  allowFullScreen
                ></iframe>
              )}
              {apod?.copyright && (
                <p className="copyright">
                  {t('home.apod.copyright')}
                  {apod.copyright}
                </p>
              )}
            </div>

            {translate ? (
              <Translator
                loaderPadding="7rem"
                text={apod ? apod.explanation : ''}
                type="p"
                className="apodExplanation"
              />
            ) : (
              <p className="apodExplanation">{apod ? apod.explanation : ''}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Apod;
