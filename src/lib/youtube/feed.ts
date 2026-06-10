import { YOUTUBE_CHANNEL, YOUTUBE_CHANNEL_ID } from "./config";

export type YouTubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "accept-language": "es-MX,es;q=0.9",
};

/**
 * Resolves the internal channel id (UC...). Uses YOUTUBE_CHANNEL_ID directly
 * when configured; otherwise fetches the channel page for the handle and
 * extracts the id from its metadata (cached for a day).
 */
async function resolveChannelId(): Promise<string | null> {
  if (YOUTUBE_CHANNEL_ID) return YOUTUBE_CHANNEL_ID;
  if (!YOUTUBE_CHANNEL) return null;

  const res = await fetch(`https://www.youtube.com/${encodeURI(YOUTUBE_CHANNEL)}`, {
    headers: BROWSER_HEADERS,
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const html = await res.text();
  return (
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ??
    html.match(/channel\/(UC[\w-]{22})/)?.[1] ??
    null
  );
}

/**
 * Latest uploads from the channel via YouTube's public RSS feed.
 * No API key required. Returns [] on any failure or when no channel is
 * configured, so the homepage never breaks because of YouTube.
 */
export async function getLatestVideos(limit = 3): Promise<YouTubeVideo[]> {
  try {
    const channelId = await resolveChannelId();
    if (!channelId) return [];

    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: BROWSER_HEADERS, next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];

    const xml = await res.text();
    const videos: YouTubeVideo[] = [];

    for (const entry of xml.split("<entry>").slice(1)) {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
      const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      if (!id || !title) continue;

      videos.push({
        id,
        title: decodeXmlEntities(title),
        publishedAt: publishedAt ?? "",
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
      if (videos.length >= limit) break;
    }

    return videos;
  } catch {
    return [];
  }
}
