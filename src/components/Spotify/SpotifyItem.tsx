import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyShow,
  SpotifyTrack,
  SpotifyEpisode,
  PreviewField,
} from '../../types';
import './SpotifyItem.scss';
import { useDominantColor } from '../../utils/colorThief';
import { useTranslation } from 'react-i18next';
import Loader from '../Loader/Loader';
import TimeSvg from '../../assets/svg/icons/time.svg';
import SpotifyLogo from '../../assets/svg/icons/spotify.svg';
import ArrowIcon from '../../assets/svg/icons/arrow-button.svg';
import { motion } from 'framer-motion';

type SpotifyItemProps = {
  itemId: string;
  type: 'albums' | 'playlists' | 'shows';
};

function SpotifyItem({ itemId, type }: SpotifyItemProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [album, setAlbum] = useState<SpotifyAlbum | undefined>();
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | undefined>();
  const [show, setShow] = useState<SpotifyShow | undefined>();
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [showTracks, setShowTracks] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { t } = useTranslation();

  const handleButtonClick = () => {
    setShowTracks(!showTracks);
  };

  const handleTrackClick = (
    trackId: string,
    previewUrl?: PreviewField,
    trackName?: string,
    trackArtist?: string
  ): void => {
    const url =
      previewUrl && typeof previewUrl === 'object'
        ? (previewUrl as { url?: string }).url ?? null
        : typeof previewUrl === 'string'
        ? previewUrl
        : null;

    if (!url) {
      console.warn('No preview available for track', { trackId, trackName });

      // TODO: afficher un feedback utilisateur (toast/snackbar)

      return;
    }

    if (!audioRef.current) {
      console.warn('Audio element not mounted yet');
      return;
    }

    const audio = audioRef.current;

    if (playingTrack === trackId) {
      if (audio.paused) {
        audio
          .play()
          .then(() => {
            setIsPaused(false);
          })
          .catch((err) => {
            console.warn('Playback failed', err);
          });
      } else {
        audio.pause();
        setIsPaused(true);
        setPlayingTrack(null);
        document.title = 'StellarNews';
      }
      return;
    }

    setPlayingTrack(trackId);
    audio.src = url;
    audio.volume = 0.3;
    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        setIsPaused(false);
      })
      .catch((err) => {
        console.warn('Playback failed', err);
        setPlayingTrack(null);
        setIsPaused(true);
      });

    if (type !== 'shows') {
      document.title = `${trackName}${trackArtist ? ' - ' + trackArtist : ''}`;
    } else {
      document.title = trackName || '';
    }
  };

  const convertMsToMinutes = (ms: number, withText?: boolean): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);

    if (withText) {
      return `${minutes} min ${seconds} s`;
    }

    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const imageUrl =
    type === 'albums' && album?.images?.[0]?.url
      ? album.images[0].url
      : type === 'playlists' && playlist?.images?.[0]?.url
      ? playlist.images[0].url
      : type === 'shows' && show?.images?.[0]?.url
      ? show.images[0].url
      : '';

  const dominantColor = useDominantColor(imageUrl || '');
  const dominantColorOpacity = useDominantColor(imageUrl || '', '0.08');

  const linkToSpotify = `https://open.spotify.com/${type.slice(
    0,
    -1
  )}/${itemId}`;

  useEffect(() => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      audioElement.onended = () => {
        setPlayingTrack(null);
        document.title = 'StellarNews';
      };

      return () => {
        audioElement.onended = null;
      };
    }
  }, [playingTrack]);

  useEffect(() => {
    const audioElement = audioRef.current;

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);

  useEffect(() => {
    const CACHE_DURATION = 1000 * 60 * 60;
    const cacheKey = (id: string, t: string) => `${t}-${id}`;

    const getCachedItem = (key: string) => {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) return undefined;
      try {
        const parsedData = JSON.parse(cachedData);

        if (
          parsedData &&
          typeof parsedData.data === 'string' &&
          parsedData.data.startsWith('import') &&
          parsedData.data.includes('export default')
        ) {
          localStorage.removeItem(key);
          return undefined;
        }
        if (Date.now() - parsedData.timestamp < CACHE_DURATION) {
          return parsedData.data;
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
      return undefined;
    };

    const setCachedItem = (key: string, data: unknown) => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch (e) {
        console.warn('Failed to set cache', e);
      }
    };

    const fetchPreviews = async (): Promise<Record<string, string>> => {
      try {
        const resp = await axios.get(
          `/api/getSpotifyPreview?type=${type}&itemId=${itemId}`
        );
        const previewMap: Record<string, string> = {};
        (resp.data.tracks || []).forEach(
          (t: { id?: string; name?: string; preview_url?: PreviewField }) => {
            const rawPreview = t.preview_url;
            const url =
              rawPreview && typeof rawPreview === 'object'
                ? (rawPreview as { url?: string }).url ?? null
                : typeof rawPreview === 'string'
                ? rawPreview
                : null;
            if (!url) return;

            if (t.id && typeof t.id === 'string') {
              const cleanedId = t.id.replace(/^spotify:track:/, '');
              previewMap[cleanedId] = url;
              previewMap[`spotify:track:${cleanedId}`] = url;
              previewMap[t.id] = url;
            }
            if (t.name) previewMap[t.name] = url;
          }
        );
        return previewMap;
      } catch (e) {
        console.warn('No previews available', e);
        return {};
      }
    };

    const mergePreviewsIntoAlbum = (
      albumData: SpotifyAlbum,
      previewMap: Record<string, string>
    ): SpotifyAlbum => {
      if (!albumData?.tracks?.items) return albumData;
      const items = albumData.tracks.items.map((track: SpotifyTrack) => {
        const rawPreview = track.preview_url;
        const trackPreviewUrl =
          rawPreview && typeof rawPreview === 'object'
            ? (rawPreview as { url?: string }).url ?? null
            : typeof rawPreview === 'string'
            ? rawPreview
            : null;
        const id = track.id ?? '';
        const name = track.name ?? '';
        const preview =
          (id && (previewMap[id] ?? previewMap[`spotify:track:${id}`])) ??
          previewMap[name] ??
          trackPreviewUrl ??
          null;
        return { ...track, preview_url: preview };
      });
      return { ...albumData, tracks: { ...albumData.tracks, items } };
    };

    const mergePreviewsIntoPlaylist = (
      playlistData: SpotifyPlaylist,
      previewMap: Record<string, string>
    ): SpotifyPlaylist => {
      if (!playlistData?.tracks?.items) return playlistData;
      const items = playlistData.tracks.items.map((it) => {
        const wrapper = it as { track?: SpotifyTrack };
        const track = (wrapper.track ?? it) as SpotifyTrack;
        const rawPreview = track.preview_url;
        const trackPreviewUrl =
          rawPreview && typeof rawPreview === 'object'
            ? (rawPreview as { url?: string }).url ?? null
            : typeof rawPreview === 'string'
            ? rawPreview
            : null;
        const id = track.id ?? '';
        const name = track.name ?? '';
        const preview =
          (id && (previewMap[id] ?? previewMap[`spotify:track:${id}`])) ??
          previewMap[name] ??
          trackPreviewUrl ??
          null;
        const mergedTrack = { ...track, preview_url: preview };
        return wrapper.track
          ? { ...wrapper, track: mergedTrack }
          : { track: mergedTrack };
      });
      return { ...playlistData, tracks: { ...playlistData.tracks, items } };
    };

    const mergePreviewsIntoShow = (
      showData: SpotifyShow,
      previewMap: Record<string, string>
    ): SpotifyShow => {
      if (!showData?.episodes?.items) return showData;
      const items = showData.episodes.items.map((ep: SpotifyEpisode) => {
        const rawPreview = ep.audio_preview_url;
        const epPreviewUrl =
          rawPreview && typeof rawPreview === 'object'
            ? (rawPreview as { url?: string }).url ?? null
            : typeof rawPreview === 'string'
            ? rawPreview
            : null;
        const id = ep.id ?? '';
        const name = ep.name ?? '';
        const preview =
          (id && (previewMap[id] ?? previewMap[`spotify:track:${id}`])) ??
          previewMap[name] ??
          epPreviewUrl ??
          null;
        return { ...ep, audio_preview_url: preview };
      });
      return { ...showData, episodes: { ...showData.episodes, items } };
    };

    const fetchSpotifyItem = async () => {
      setLoading(true);
      const key = cacheKey(itemId, type);
      const cached = getCachedItem(key);
      if (cached) {
        switch (type) {
          case 'albums':
            setAlbum(cached);
            break;
          case 'playlists':
            setPlaylist(cached);
            break;
          case 'shows':
            setShow(cached);
            break;
        }
        setLoading(false);
        console.log(`${type} from cache:`, cached);
        return;
      }

      try {
        const response = await axios.get(
          `/api/getSpotifyItem?itemId=${itemId}&type=${type}`
        );
        let data = response.data;

        const previewMap = await fetchPreviews();

        if (type === 'albums') {
          data = mergePreviewsIntoAlbum(data, previewMap);
          setAlbum(data);
        } else if (type === 'playlists') {
          data = mergePreviewsIntoPlaylist(data, previewMap);
          setPlaylist(data);
        } else if (type === 'shows') {
          data = mergePreviewsIntoShow(data, previewMap);
          setShow(data);
        }

        setCachedItem(key, data);

        setLoading(false);
        console.log(`${type} from API:`, data);
      } catch (error) {
        console.error('fetchSpotifyItem error', error);
        setLoading(false);
      }
    };

    fetchSpotifyItem();
  }, [itemId, type]);

  if (loading) {
    return (
      <div className="spotifyItem">
        <Loader padding="4rem" />
      </div>
    );
  }

  return (
    <div className="spotifyContainer">
      <audio ref={audioRef} controls style={{ display: 'none' }} />
      <div
        className="spotifyItem"
        style={{
          backgroundColor: dominantColor,
          borderRadius: showTracks ? '8px 8px 0 0' : '8px',
        }}
      >
        <div className="buttons">
          <div className="spotifyButton showButton">
            <a onClick={handleButtonClick}>
              {type !== 'shows' &&
                (showTracks
                  ? t('home.spotify.buttons.hide-tracks')
                  : t('home.spotify.buttons.show-tracks'))}
              {type === 'shows' &&
                (showTracks
                  ? t('home.spotify.buttons.hide-description')
                  : t('home.spotify.buttons.show-description'))}
              <img
                src={ArrowIcon}
                alt="arrowIcon"
                style={{ transform: showTracks ? 'rotate(-90deg)' : '' }}
              />
            </a>
          </div>
          <div className="spotifyButton">
            <a href={linkToSpotify} target="_blank" rel="noreferrer">
              {t('home.spotify.buttons.link')}
              <img src={SpotifyLogo} alt="spotifyLogo" />
            </a>
          </div>
        </div>
        <img
          className="picture"
          src={imageUrl}
          alt=""
          style={{ borderRadius: showTracks ? '8px 0 0 0' : '8px 0 0 8px' }}
        />
        <div className="rightContent">
          <span className="type">
            {album?.type || playlist?.type || show?.type}
          </span>
          <p className="name">{album?.name || playlist?.name || show?.name}</p>

          {type === 'playlists' && (
            <span className="description">{playlist?.description}</span>
          )}

          <div className="infos">
            <div className="artists">
              {type === 'albums' &&
                album?.artists?.map((artist, index) => (
                  <span key={artist.id}>
                    <a
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {artist.name}
                    </a>
                    {album?.artists && index < album.artists.length - 1 && ', '}
                  </span>
                ))}
              {type === 'playlists' && (
                <a
                  href={playlist?.owner?.external_urls?.spotify}
                  target="_blank"
                  rel="noreferrer"
                >
                  {playlist?.owner?.display_name}
                </a>
              )}
              {type === 'shows' && <span>{show?.publisher}</span>}
            </div>

            {type === 'albums' && (
              <span className="date">
                • {album?.release_date && album.release_date.split('-')[0]}
              </span>
            )}

            {type !== 'shows' && (
              <span className="details">
                • {album?.total_tracks || playlist?.followers?.total}
                {type === 'albums' && t('home.spotify.details.album')}
                {type === 'playlists' && t('home.spotify.details.playlist')}
              </span>
            )}
          </div>
        </div>
      </div>
      {showTracks && (
        <motion.div
          className="spotifyTracks"
          style={{ backgroundColor: dominantColorOpacity }}
          initial={{ opacity: 0, height: 0 }}
          exit={{ opacity: 0, height: 0 }}
          animate={{
            height: showTracks ? 'auto' : 0,
            opacity: showTracks ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {type !== 'shows' && (
            <div className="tracksHeader">
              <span className="tracksHeaderNumber">#</span>
              <span className="tracksHeaderTitle">
                {t('home.spotify.tracks.title')}
              </span>
              <img src={TimeSvg} alt="time" />
            </div>
          )}

          {type === 'shows' &&
            show?.episodes.items.slice(0, 1).map((episode) => (
              <div key={episode.id} className="showContainer">
                <div className="showHeader">
                  <h3>{t('home.spotify.show.about')}</h3>
                  <div
                    className="showDescription"
                    dangerouslySetInnerHTML={{
                      __html: show.html_description || '',
                    }}
                  />
                </div>

                <div className="spotifyButton">
                  <a
                    href={`https://open.spotify.com/episode/${episode.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('home.spotify.buttons.episode')}
                    <img src={SpotifyLogo} alt="spotifyLogo" />
                  </a>
                </div>

                <div className="episodeContainer">
                  <h3>{t('home.spotify.show.last-episode')}</h3>
                  <div
                    className={`episodeInfos ${
                      playingTrack === episode.id ? 'playing' : ''
                    }`}
                  >
                    <div className="episodeImageContainer">
                      <img
                        src={episode.images?.[0]?.url || ''}
                        alt="episodeImage"
                        className="episodeImage"
                      />
                      <div
                        className="imageOverlay"
                        onClick={() => {
                          const rawPreview = episode.audio_preview_url;
                          const previewUrl =
                            rawPreview && typeof rawPreview === 'object'
                              ? (rawPreview as { url?: string }).url ?? null
                              : typeof rawPreview === 'string'
                              ? rawPreview
                              : null;
                          handleTrackClick(
                            episode.id || '',
                            previewUrl,
                            show.name || ''
                          );
                        }}
                      >
                        <span>
                          {playingTrack === episode.id && !isPaused
                            ? '❚❚'
                            : '▶'}
                        </span>
                      </div>
                    </div>

                    <div className="episodeRight">
                      <span className="episodeTitle">{episode.name}</span>
                      <span className="episodeShowName">{show?.name}</span>
                      <div
                        className="episodeDescription"
                        dangerouslySetInnerHTML={{
                          __html: episode.html_description || '',
                        }}
                      />
                      <div className="episodeDetails">
                        <div className="episodeDate">
                          {episode.release_date
                            ? new Date(
                                episode.release_date
                              ).toLocaleDateString()
                            : ''}
                        </div>
                        <div className="episodeDateContainer">
                          <span className="episodeDuration">
                            •{' '}
                            {convertMsToMinutes(episode.duration_ms || 0, true)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {type === 'albums' &&
            album?.tracks.items.map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className={`track ${
                  playingTrack === track.id ? 'playing' : ''
                }`}
                onMouseEnter={() => setHoveredTrack(index)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() =>
                  handleTrackClick(
                    track.id || '',
                    track.preview_url,
                    track.name,
                    track.artists?.[0]?.name
                  )
                }
              >
                <span className="trackNumber">
                  {hoveredTrack === index
                    ? playingTrack === track.id && !isPaused
                      ? '❚❚'
                      : '▶'
                    : playingTrack === track.id
                    ? !isPaused
                      ? '❚❚'
                      : index + 1
                    : index + 1}{' '}
                </span>
                <div className="trackInfos">
                  <span className="trackName">{track.name}</span>
                  <span className="trackArtist">
                    {track?.artists?.map((artist) => artist.name).join(', ')}
                  </span>
                </div>

                <span className="trackDuration">
                  {convertMsToMinutes(track.duration_ms || 0)}
                </span>
              </div>
            ))}

          {type === 'playlists' &&
            playlist?.tracks.items.map((track, index) => (
              <div
                key={`${track.track.id}-${index}`}
                className={`track ${
                  playingTrack === track.track.id ? 'playing' : ''
                }`}
                onMouseEnter={() => setHoveredTrack(index)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() =>
                  handleTrackClick(
                    track.track.id || '',
                    track.track.preview_url,
                    track.track.name,
                    track.track.artists?.[0]?.name
                  )
                }
              >
                <span className="trackNumber">
                  {hoveredTrack === index
                    ? playingTrack === track.track.id && !isPaused
                      ? '❚❚'
                      : '▶'
                    : playingTrack === track.track.id
                    ? !isPaused
                      ? '❚❚'
                      : index + 1
                    : index + 1}{' '}
                </span>
                <div className="trackInfos">
                  <span className="trackName">{track.track.name}</span>
                  <span className="trackArtist">
                    {track.track.artists
                      ?.map((artist) => artist.name)
                      .join(', ')}
                  </span>
                </div>

                <span className="trackDuration">
                  {convertMsToMinutes(track.track.duration_ms || 0)}
                </span>
              </div>
            ))}
        </motion.div>
      )}
    </div>
  );
}

export default SpotifyItem;
