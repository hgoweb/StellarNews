import { motion, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Apod from '../../components/Apod/Apod';
import LangButton from '../../components/LangButton/LangButton';
import StellarNewsLogo from '../../components/StellarNewsLogo/StellarNewsLogo';
import User from '../../components/User/User';
import i18n from '../../utils/i18n';
import './Home.scss';
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';

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
      <div className="header" id="header">
        <StellarNewsLogo height="50px" />

        <LangButton
          onLanguageChange={handleLanguageChange}
          controls={controls}
        />
      </div>

      <motion.div
        className="content"
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <NavBar animationKey={animationKey} />

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
            transition={{ repeat: 0, ease: 'linear', duration: 1.3 }}
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

        <div id="xUsers">
          <motion.h3
            key={`usersTitle-${animationKey}`}
            className="usersTitle"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.25, ease: 'anticipate' }}
          >
            {t('home.x-user.title')}
          </motion.h3>

          <div
            className="usersContainer"
            key={`usersContainer-${animationKey}`}
          >
            {xUsers.map((username, index) => (
              <User
                key={username}
                username={username}
                translate={i18n.language === 'fr' ? true : false}
                delay={index * 0.3}
              />
            ))}
          </div>
        </div>

        <div id="spotify">
          <motion.h3
            key={`spotifyTitle-${animationKey}`}
            className="spotifyTitle"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.25, ease: 'anticipate' }}
          >
            {'Listen to our Spotify playlist'}
          </motion.h3>
          <iframe
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0Yxoavh5qJV"
            width="100%"
            height="380"
            frameBorder="0"
            allow="encrypted-media"
            title="Spotify playlist"
          ></iframe>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
