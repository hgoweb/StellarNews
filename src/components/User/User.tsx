import axios from 'axios';
import { useEffect, useState } from 'react';
import './User.scss';
import locationSvg from '../../assets/svg/icons/location.svg';
import xLogo from '../../assets/svg/icons/x-logo.svg';
import xVerified from '../../assets/svg/icons/x-verified-badge.svg';
import linkSvg from '../../assets/svg/icons/link.svg';
import { useTranslation } from 'react-i18next';
import Translator from '../Translator/Translator';
import { useDominantColor } from '../../utils/colorThief';
import Loader from '../Loader/Loader';
import { motion } from 'framer-motion';

interface User {
  created_at: string;
  description: string;
  entities: {
    url: {
      urls: {
        display_url: string;
        expanded_url: string;
      }[];
    };
  };
  id: string;
  location: string;
  name: string;
  profile_image_url: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  url: string;
  username: string;
  verified: boolean;
  verified_type: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

type UserProps = {
  username: string;
  translate: boolean;
  delay: number;
};

function User({ username, translate, delay }: UserProps) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(true);

  const { t } = useTranslation();
  const dominantColor = useDominantColor(user?.profile_image_url || '');

  const formatNumber = (number: number | undefined): string => {
    if (!number) {
      return '0';
    }

    if (number < 1000) {
      return number.toString();
    }

    if (number > 1000000) {
      const formattedNumber = (number / 1000000).toFixed(1);

      return `${formattedNumber}M`;
    }

    const formattedNumber = (number / 1000).toFixed(1);

    return `${formattedNumber}k`;
  };

  useEffect(() => {
    const CACHE_DURATION = 1000 * 60 * 60;

    const getCachedUser = (username: string): User | undefined => {
      const cachedData = localStorage.getItem(username);

      if (cachedData) {
        const parsedData: CachedData<User> = JSON.parse(cachedData);

        if (Date.now() - parsedData.timestamp < CACHE_DURATION) {
          return parsedData.data;
        } else {
          localStorage.removeItem(username);
        }
      }

      return undefined;
    };

    const fetchUser = async () => {
      setLoading(true);
      const cachedUser = getCachedUser(username);

      if (cachedUser) {
        console.log('User fetched from cache');
        setUser(cachedUser);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/getUser?username=${username}`);

        const userToCache: CachedData<User> = {
          data: response.data.data,
          timestamp: Date.now(),
        };

        localStorage.setItem(username, JSON.stringify(userToCache));

        setUser(response.data.data);

        console.log('User fetched from API');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  return (
    <motion.div
      className="user"
      style={{ backgroundColor: dominantColor }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: 'easeOut', delay: delay }}
    >
      <div className="linkToProfile">
        <a href={`https://x.com/${username}`} target="_blank" rel="noreferrer">
          {t('home.x-user.linkToProfile')}
          <img src={xLogo} alt="x-logo" />
        </a>
      </div>
      {loading ? (
        <Loader padding="0.1rem" />
      ) : (
        <div className="profileContainer">
          <img
            src={user?.profile_image_url}
            alt="profilePicture"
            className="profilePicture"
          />
          <div className="leftText">
            <div className="nameContainer">
              <h3>{user?.name}</h3>
              {user?.verified && (
                <img src={xVerified} alt="verified" className="verified" />
              )}
            </div>
            <p>@{user?.username}</p>
          </div>
        </div>
      )}
      {loading ? (
        <Loader padding="0.1rem" />
      ) : (
        <div className="bottomText">
          {user && translate ? (
            <Translator
              text={user?.description}
              type="p"
              loaderPadding="0.1rem"
              className="description"
            />
          ) : (
            <p className="description">{user?.description}</p>
          )}
          <div className="userInfo">
            <div className="userInfoItem">
              <img src={locationSvg} alt="location" className="icon" />
              {user && translate ? (
                <Translator
                  text={user?.location}
                  type="p"
                  loaderPadding="0.1rem"
                  className="location"
                />
              ) : (
                <p>{user?.location}</p>
              )}
            </div>
            <div className="urlsContainer">
              <div className="userInfoItem">
                <img src={linkSvg} alt="link" className="icon url" />
                <a
                  href={user?.entities.url.urls[0].expanded_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user?.entities.url.urls[0].display_url}
                </a>
              </div>
            </div>
          </div>
          <div className="metrics">
            <div className="metricsText">
              <span>{formatNumber(user?.public_metrics.following_count)}</span>
              <p>{t('home.x-user.following')}</p>
            </div>
            <div className="metricsText">
              <span>{formatNumber(user?.public_metrics.followers_count)}</span>
              <p>{t('home.x-user.followers')}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default User;
