import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-scroll';
import SNLogo from '../../assets/svg/StellarNews-Logo.svg';
import PlanetSvg from '../../assets/svg/icons/planet.svg';
import SpotifySvg from '../../assets/svg/icons/spotify.svg';
import XLogo from '../../assets/svg/icons/x-logo.svg';
import './NavBar.scss';

const sections = ['header', 'apod', 'xUsers', 'spotify'];

type NavBarProps = {
  animationKey: number;
};

function NavBar({ animationKey }: NavBarProps) {
  const [activeSection, setActiveSection] = useState<string>('header');

  const { t } = useTranslation();

  const sectionsNames = [
    t('home.navbar.header'),
    t('home.navbar.apod'),
    t('home.navbar.xUsers'),
    t('home.navbar.spotify'),
  ];

  const sectionsLogo = [SNLogo, PlanetSvg, XLogo, SpotifySvg];

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <nav className="navBar" key={`navBar-${animationKey}`}>
      <ul>
        {sections.map((section, index) => (
          <motion.li
            key={section}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: 'backInOut',
              delay: index * 0.25,
            }}
          >
            <Link
              to={section}
              smooth={true}
              duration={500}
              offset={-65}
              className={activeSection === section ? 'active' : ''}
            >
              <img
                src={sectionsLogo[sections.indexOf(section)]}
                alt={sectionsNames[sections.indexOf(section)]}
              />
              <span>{sectionsNames[sections.indexOf(section)]}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
