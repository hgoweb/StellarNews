export type PreviewField = string | { format?: string; url?: string } | null;

export interface SpotifyAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyImage {
  url: string;
  height?: number | null; // { changed code }
  width?: number | null;  // { changed code }
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface SpotifyTrack {
  album?: SpotifyAlbum;
  artists?: SpotifyArtist[];
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: SpotifyExternalUrls;
  href?: string;
  id?: string;
  is_local?: boolean;
  name?: string;
  preview_url?: PreviewField; // { changed code }
  track_number?: number;
  type?: string;
  uri?: string;
}

export interface SpotifyEpisode {
  audio_preview_url?: PreviewField; // { changed code }
  description?: string;
  duration_ms?: number;
  explicit?: boolean;
  external_urls?: SpotifyExternalUrls;
  href?: string;
  html_description?: string; // { changed code }
  id?: string;
  images?: SpotifyImage[];
  name?: string;
  release_date?: string;
  is_externally_hosted?: boolean;
  is_playable?: boolean;
}

export interface SpotifyAlbum {
  album_type?: string;
  total_tracks?: number;
  external_urls?: SpotifyExternalUrls;
  href?: string;
  id: string;
  images?: SpotifyImage[];
  name?: string;
  release_date?: string;
  release_date_precision?: string;
  tracks: {
    items: SpotifyTrack[];
    [key: string]: unknown;
  };
  type?: string;
  uri?: string;
  artists?: SpotifyArtist[];
}

export interface SpotifyPlaylist {
  description?: string;
  external_urls?: SpotifyExternalUrls;
  followers?: {
    href?: string;
    total?: number;
  };
  href?: string;
  id: string;
  images?: SpotifyImage[];
  name?: string;
  owner?: {
    external_urls?: SpotifyExternalUrls;
    href?: string;
    id?: string;
    type?: string;
    uri?: string;
    display_name?: string;
  };
  public?: boolean;
  snapshot_id?: string;
  tracks: {
    items: { track: SpotifyTrack }[]; // keep wrapper
  };
  type?: string;
  uri?: string;
}

export interface SpotifyShow {
  description?: string;
  episodes: {
    items: SpotifyEpisode[];
  };
  external_urls?: SpotifyExternalUrls;
  href?: string;
  html_description?: string; // { changed code }
  id: string;
  images?: SpotifyImage[];
  name?: string;
  publisher?: string;
  type?: string;
  uri?: string;
  total_episodes?: number;
}
