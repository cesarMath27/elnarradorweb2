import { getLatestVideos } from "@/lib/youtube/feed";
import { YOUTUBE_CHANNEL_URL } from "@/lib/youtube/config";
import VideoCard from "./VideoCard";

// Sección "El Narrador en Video" para la portada. Si no hay canal configurado
// (ver src/lib/youtube/config.ts) o el feed falla, no renderiza nada.
export default async function VideoSection() {
  const videos = await getLatestVideos(3);
  if (videos.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          El Narrador en Video
        </h2>
        <div className="flex-1 h-px bg-border" />
        {YOUTUBE_CHANNEL_URL && (
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gold-dark hover:text-gold transition-colors duration-200"
          >
            Ver canal →
          </a>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
