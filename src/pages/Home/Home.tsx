import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Apod from '../../components/Apod/Apod';
import LangButton from '../../components/LangButton/LangButton';
import StellarNewsLogo from '../../components/StellarNewsLogo/StellarNewsLogo';
import User from '../../components/User/User';
import i18n from '../../utils/i18n';
import './Home.scss';
import { useEffect, useState } from 'react';

function Home() {
  const [animationKey, setAnimationKey] = useState<number>(0);

  const { t } = useTranslation();

  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1 });
  }, [controls]);

  const xUsers = ['AstronomyMag', 'NASAHubble', 'esa'];

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setAnimationKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="homePage">
      <div className="header">
        <StellarNewsLogo height="50px" />

        <LangButton
          onLanguageChange={handleLanguageChange}
          controls={controls}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.h1
          key={`homePageTitle-${animationKey}`}
          className="homePageTitle"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {t('home.title')}
          <motion.div
            key={`homePageTitleLogo-${animationKey}`}
            className="homePageTitleLogo"
            animate={{ opacity: 1, rotateY: 360 }}
            transition={{ repeat: 0, ease: 'linear', duration: 1.4 }}
          >
            🪐
          </motion.div>
        </motion.h1>

        <motion.p
          key={`homeDescription-${animationKey}`}
          className="homeDescription"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {t('home.description')}
        </motion.p>

        <Apod
          animationKey={animationKey}
          translate={i18n.language === 'fr' ? true : false}
        />

        <motion.h3
          key={`usersTitle-${animationKey}`}
          className="usersTitle"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.25, ease: 'anticipate' }}
        >
          {t('home.x-user.title')}
        </motion.h3>

        <div className="usersContainer" key={`usersContainer-${animationKey}`}>
          {xUsers.map((username, index) => (
            <User
              key={username}
              username={username}
              translate={i18n.language === 'fr' ? true : false}
              delay={index * 0.3}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
