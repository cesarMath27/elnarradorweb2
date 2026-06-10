import { YOUTUBE_CHANNEL_ID } from "./config";

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

/**
 * Latest uploads from the channel via YouTube's public RSS feed.
 * No API key required. Returns [] on any failure or when no channel is
 * configured, so the homepage never breaks because of YouTube.
 */
export async function getLatestVideos(limit = 3): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_CHANNEL_ID) return [];

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 1800 } }
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
