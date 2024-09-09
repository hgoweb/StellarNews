import { motion, AnimatePresence, AnimationControls } from 'framer-motion';
import { useState } from 'react';
import FranceFlag from '../../assets/svg/France.svg';
import GlobeSvg from '../../assets/svg/icons/globe-outline.svg';
import UKFlag from '../../assets/svg/United_Kingdom.svg';
import i18n from '../../utils/i18n';
import './LangButton.scss';
import { on } from 'events';

type LangButtonProps = {
  controls: AnimationControls;
  onLanguageChange: (language: string) => void;
};

function LangButton({ controls, onLanguageChange }: LangButtonProps) {
  const [showLanguages, setShowLanguages] = useState<boolean>(false);

  const toggleLanguages = () => {
    setShowLanguages(!showLanguages);
  };

  const changeLanguage = async (language: string) => {
    await controls.start({ opacity: 0 });
    onLanguageChange(language);
    await controls.start({ opacity: 1 });

    setShowLanguages(false);
  };

  return (
    <div className="langButtonContainer">
      <div className="langButtonBackground"></div>
      <img
        src={GlobeSvg}
        alt="globe-icon"
        className="globeIcon"
        onClick={toggleLanguages}
      />

      <AnimatePresence>
        {showLanguages && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: -20 }}
            exit={{ opacity: 0, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="langButtons"
          >
            <button onClick={() => changeLanguage('en')} className="langButton">
              <img src={UKFlag} alt="en-flag" />
            </button>
            <button onClick={() => changeLanguage('fr')} className="langButton">
              <img src={FranceFlag} alt="fr-flag" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LangButton;
