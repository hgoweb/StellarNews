import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';
import StellarNewsLogo from '../../components/StellarNewsLogo/StellarNewsLogo';
import './Home.scss';
import Apod from '../../components/Apod/Apod';
import FranceFlag from '../../assets/svg/France.svg';
import UKFlag from '../../assets/svg/United_Kingdom.svg';

function Home() {
  const { t } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="homePage">
      <StellarNewsLogo height="50px" />

      <h1 className="homePageTitle">{t('home.title')}</h1>
      <p>{t('home.description')}</p>

      <div className="langButtonsContainer">
        <button onClick={() => changeLanguage('en')} className="langButton">
          <img src={UKFlag} alt="en-flag" />
        </button>
        <button onClick={() => changeLanguage('fr')} className="langButton">
          <img src={FranceFlag} alt="fr-flag" />
        </button>
      </div>

      <Apod
        randomize={false}
        translate={i18n.language === 'fr' ? true : false}
      />
    </div>
  );
}

export default Home;
