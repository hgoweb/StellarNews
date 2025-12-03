import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type PreviewField = string | { format?: string; url?: string } | null;

interface PreviewEntry {
  id?: string | null;
  name?: string | null;
  preview_url?: PreviewField;
  raw?: unknown;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const extractPreviewUrl = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (isObject(value)) {
    const maybeUrl = value['url'];
    return typeof maybeUrl === 'string' ? maybeUrl : null;
  }
  return null;
};

function collectPreviews(
  input: unknown,
  out: PreviewEntry[] = []
): PreviewEntry[] {
  if (input == null) return out;

  if (Array.isArray(input)) {
    for (const item of input) collectPreviews(item, out);
    return out;
  }

  if (!isObject(input)) return out;

  const previewKeys = [
    'audioPreview',
    'audioPreviewUrl',
    'audio_preview_url',
    'preview_url',
    'audioPreviewUrl',
    'previewUrl',
    'preview',
  ];
  const idKeys = ['id', 'uri'];
  const nameKeys = ['name', 'title'];

  for (const k of previewKeys) {
    if (k in input) {
      const rawPreview = (input as Record<string, unknown>)[k];
      const url = extractPreviewUrl(rawPreview);
      if (url) {
        const id = idKeys
          .map((kk) => input[kk])
          .find((v) => typeof v === 'string') as string | undefined;
        const name = nameKeys
          .map((kk) => input[kk])
          .find((v) => typeof v === 'string') as string | undefined;
        out.push({
          id: id ?? null,
          name: name ?? null,
          preview_url:
            typeof rawPreview === 'string'
              ? rawPreview
              : isObject(rawPreview)
              ? (rawPreview as { url?: string })
              : null,
          raw: input,
        });
        break;
      }
    }
  }

  for (const key of Object.keys(input)) {
    try {
      collectPreviews((input as Record<string, unknown>)[key], out);
    } catch {
      // ignore errors
    }
  }

  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawItemId = req.query.itemId;
    const rawType = req.query.type;
    if (
      !rawItemId ||
      !rawType ||
      Array.isArray(rawItemId) ||
      Array.isArray(rawType)
    ) {
      return res.status(400).json({ error: 'itemId and type required' });
    }
    const itemId = String(rawItemId);
    const incomingType = String(rawType);

    const mapType: Record<string, string> = {
      albums: 'album',
      playlists: 'playlist',
      shows: 'show',
    };
    const embedType = mapType[incomingType];
    if (!embedType) return res.status(400).json({ error: 'unsupported type' });

    const tryUrls = [
      `https://open.spotify.com/embed/${embedType}/${itemId}`,
      `https://open.spotify.com/${embedType}/${itemId}`,
    ];

    let html: string | null = null;
    const axiosCfg = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StellarNews/1.0',
        Accept: 'text/html',
      },
      timeout: 10000,
      responseType: 'text' as const,
      validateStatus: (status: number) => status >= 200 && status < 400,
    };

    for (const u of tryUrls) {
      try {
        const r = await axios.get<string>(u, axiosCfg);
        if (typeof r.data === 'string' && r.data.length) {
          html = r.data;
          break;
        }
      } catch (err) {
        // ignore errors
      }
    }

    if (!html) return res.status(404).json({ error: 'Spotify page not found' });

    const regex =
      /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s;
    const match = html.match(regex);
    if (!match)
      return res.status(404).json({ error: 'No __NEXT_DATA__ in page' });

    let jsonData: unknown;
    try {
      jsonData = JSON.parse(match[1]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to parse __NEXT_DATA__' });
    }

    const previews = collectPreviews(jsonData).filter((p) => {
      const url = extractPreviewUrl(p.preview_url);
      return !!url;
    });

    const uniqueMap = new Map<
      string,
      { id?: string | null; name?: string | null; preview_url: string }
    >();
    for (const p of previews) {
      const rawPreview = p.preview_url;
      const url = extractPreviewUrl(rawPreview) as string;
      const id = p.id ?? p.name ?? null;
      const key = id ?? url;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: p.id ?? undefined,
          name: p.name ?? undefined,
          preview_url: url,
        });
      }
    }

    const tracks = Array.from(uniqueMap.values()).map((v) => ({
      id: v.id ?? undefined,
      name: v.name ?? undefined,
      preview_url: { url: v.preview_url } as { url: string },
    }));

    return res.status(200).json({ tracks });
  } catch (err) {
    console.error('getSpotifyPreview error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
