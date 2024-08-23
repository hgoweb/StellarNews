import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';
import StellarNewsLogo from '../../components/StellarNewsLogo/StellarNewsLogo';
import './Home.scss';

function Home() {
  const { t } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="homePage">
      <StellarNewsLogo height="50px" />

      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>

      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
    </div>
  );
}

export default Home;
