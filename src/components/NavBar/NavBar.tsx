import { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import './NavBar.scss';

const sections = ['header', 'apod', 'xUsers', 'spotify'];

function NavBar() {
  const [activeSection, setActiveSection] = useState<string>('header');

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
    <nav className="navBar">
      <ul>
        {sections.map((section) => (
          <li key={section}>
            <Link
              to={section}
              smooth={true}
              duration={500}
              offset={-65}
              className={activeSection === section ? 'active' : ''}
            >
              {section}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default NavBar;
